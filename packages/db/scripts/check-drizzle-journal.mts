import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(packageDir, "../drizzle");
const journalPath = resolve(migrationsDir, "meta/_journal.json");

const migrationFiles = (await readdir(migrationsDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  throw new Error(
    "[drizzle-journal] No SQL migrations found under packages/db/drizzle.",
  );
}

const duplicateTags = migrationFiles.filter(
  (name, index, files) => files.indexOf(name) !== index,
);

if (duplicateTags.length > 0) {
  throw new Error(
    `[drizzle-journal] Duplicate migration filenames: ${duplicateTags.join(", ")}`,
  );
}

const journal = JSON.parse(await readFile(journalPath, "utf8")) as {
  entries: Array<{ tag: string }>;
};

const journalTags = journal.entries.map((entry) => `${entry.tag}.sql`);
const journalSet = new Set(journalTags);
const fileSet = new Set(migrationFiles);

const orphanSql = migrationFiles.filter((name) => !journalSet.has(name));
const missingSql = journalTags.filter((name) => !fileSet.has(name));

if (orphanSql.length > 0) {
  throw new Error(
    `[drizzle-journal] SQL files missing from meta/_journal.json: ${orphanSql.join(", ")}`,
  );
}

if (missingSql.length > 0) {
  throw new Error(
    `[drizzle-journal] Journal entries missing SQL files: ${missingSql.join(", ")}`,
  );
}

console.log(
  `[drizzle-journal] ${migrationFiles.length} migration SQL files match journal (latest: ${migrationFiles.at(-1)}).`,
);
