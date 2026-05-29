import { readdir, readFile } from "node:fs/promises";
import { resolveRepoRootFile } from "./system-admin.repo-root-file.repository.server";

export type SystemAdminMigrationHealthSnapshot = {
  journalEntryCount: number;
  sqlMigrationCount: number;
  isConsistent: boolean;
  detail: string;
};

export async function evaluateMigrationHealth(): Promise<SystemAdminMigrationHealthSnapshot> {
  const journalPath = await resolveRepoRootFile(
    "packages/db/drizzle/meta/_journal.json",
  );
  const drizzleDir = await resolveRepoRootFile("packages/db/drizzle");

  const journalRaw = await readFile(journalPath, "utf8");
  const journal = JSON.parse(journalRaw) as { entries?: unknown[] };
  const journalEntryCount = journal.entries?.length ?? 0;

  const sqlMigrationCount = (
    await readdir(drizzleDir, { withFileTypes: true })
  ).filter(
    (entry) => entry.isFile() && entry.name.endsWith(".sql"),
  ).length;

  const isConsistent = journalEntryCount === sqlMigrationCount;
  const detail = isConsistent
    ? `${journalEntryCount} journal entries match ${sqlMigrationCount} migration SQL files.`
    : `Journal lists ${journalEntryCount} entries but ${sqlMigrationCount} migration SQL files were found.`;

  return {
    journalEntryCount,
    sqlMigrationCount,
    isConsistent,
    detail,
  };
}
