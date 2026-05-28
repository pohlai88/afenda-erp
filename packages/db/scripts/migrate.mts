import { config } from "dotenv";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");
const migrationsDir = resolve(packageDir, "../drizzle");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const migrationUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.DATABASE_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_MIGRATION_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_URL before running migrations.",
  );
}

const sql = neon(migrationUrl);

function isDuplicateDdlError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.includes("already exists");
}

async function ensurePgVectorExtension() {
  await sql.query(`create extension if not exists vector`);
}

async function ensureMigrationTable() {
  await sql.query(`
    create table if not exists afenda_schema_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamp with time zone default now() not null
    )
  `);
}

async function getAppliedMigrations() {
  const rows = await sql<{ name: string }[]>`
    select name
    from afenda_schema_migrations
  `;

  return new Set(rows.map((row) => row.name));
}

function checksum(contents: string) {
  return createHash("sha256").update(contents).digest("hex");
}

async function hasPartialSchemaState() {
  const rows = await sql<{ object_name: string }[]>`
    select object_name
    from (
      select table_name as object_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in (
          'audit_logs',
          'user_profiles',
          'organization_memberships',
          'organizations'
        )
      union
      select typname as object_name
      from pg_type
      where typname in ('audit_entity_type', 'organization_role')
    ) objects
  `;

  return rows.length > 0;
}

async function applyMigration(
  name: string,
  contents: string,
  allowExistingObjects: boolean,
) {
  const statements = contents
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      if (!allowExistingObjects || !isDuplicateDdlError(error)) {
        throw error;
      }
    }
  }

  await sql`
    insert into afenda_schema_migrations (name, checksum)
    values (${name}, ${checksum(contents)})
    on conflict (name) do update
    set checksum = excluded.checksum
  `;
}

async function main() {
  await ensurePgVectorExtension();
  await ensureMigrationTable();
  const applied = await getAppliedMigrations();
  const allowExistingObjects =
    applied.size === 0 && (await hasPartialSchemaState());
  const migrationFiles = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    if (applied.has(migrationFile)) {
      process.stdout.write(`Skipping ${migrationFile} (already applied).\n`);
      continue;
    }

    const contents = await readFile(
      resolve(migrationsDir, migrationFile),
      "utf8",
    );
    await applyMigration(migrationFile, contents, allowExistingObjects);
    process.stdout.write(`Applied ${migrationFile}.\n`);
  }

  process.stdout.write("Migration run complete.\n");
}

main().catch((error) => {
  process.stderr.write(
    `Migration run failed. ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
