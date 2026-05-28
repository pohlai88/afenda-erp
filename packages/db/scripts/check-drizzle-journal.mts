import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const migrationsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../drizzle",
);

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

console.log(
  `[drizzle-journal] ${migrationFiles.length} migration SQL files are present (latest: ${migrationFiles.at(-1)}).`,
);
