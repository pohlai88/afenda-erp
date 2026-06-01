import { config } from "dotenv";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
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

async function ensureErpModuleIdEnumValues() {
  const requiredValues = ["system-admin"] as const;

  for (const value of requiredValues) {
    await sql.query(
      `ALTER TYPE erp_module_id ADD VALUE IF NOT EXISTS '${value}'`,
    );
  }
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

async function applyMigration(name: string, contents: string) {
  const statements = contents
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      if (isDuplicateDdlError(error)) {
        process.stdout.write(
          `Skipping existing object while applying ${name}.\n`,
        );
        continue;
      }
      throw error;
    }
  }

  await sql`
    insert into afenda_schema_migrations (name, checksum)
    values (${name}, ${checksum(contents)})
    on conflict (name) do update
    set checksum = excluded.checksum
  `;
}

async function loadJournalMigrationFiles() {
  const journalPath = resolve(migrationsDir, "meta/_journal.json");
  const journal = JSON.parse(await readFile(journalPath, "utf8")) as {
    entries: Array<{ tag: string }>;
  };

  return journal.entries.map((entry) => `${entry.tag}.sql`);
}

async function main() {
  await ensurePgVectorExtension();
  await ensureErpModuleIdEnumValues();
  await ensureMigrationTable();
  const applied = await getAppliedMigrations();
  const migrationFiles = await loadJournalMigrationFiles();

  for (const migrationFile of migrationFiles) {
    if (applied.has(migrationFile)) {
      process.stdout.write(`Skipping ${migrationFile} (already applied).\n`);
      continue;
    }

    const contents = await readFile(
      resolve(migrationsDir, migrationFile),
      "utf8",
    );
    await applyMigration(migrationFile, contents);
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
