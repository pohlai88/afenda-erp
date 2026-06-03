import { access } from "node:fs/promises";
import { resolveRepoRootFile } from "./system-admin.repo-root-file.repository.server";

export type SystemAdminRepositoryHealthCheck = {
  id: string;
  label: string;
  status: "pass" | "fail";
  detail: string;
};

export type SystemAdminRepositoryHealthSnapshot = {
  checks: readonly SystemAdminRepositoryHealthCheck[];
  blockedCount: number;
  warningCount: number;
};

async function pathExists(relativePath: string) {
  try {
    await access(await resolveRepoRootFile(relativePath));
    return true;
  } catch {
    return false;
  }
}

export async function evaluateRepositoryHealth(): Promise<SystemAdminRepositoryHealthSnapshot> {
  const checks: SystemAdminRepositoryHealthCheck[] = [
    {
      id: "architecture-index",
      label: "Architecture doctrine index",
      status: (await pathExists("docs/architecture/README.md")) ? "pass" : "fail",
      detail: "docs/architecture/README.md",
    },
    {
      id: "drizzle-journal",
      label: "Drizzle migration journal",
      status: (await pathExists("packages/db/drizzle/meta/_journal.json"))
        ? "pass"
        : "fail",
      detail: "packages/db/drizzle/meta/_journal.json",
    },
    {
      id: "architecture-guard",
      label: "Directory architecture guard",
      status: (await pathExists("scripts/check-directory-architecture.mts"))
        ? "pass"
        : "fail",
      detail: "scripts/check-directory-architecture.mts",
    },
    {
      id: "agents-guide",
      label: "ERP agent guide",
      status: (await pathExists("AGENTS.md")) ? "pass" : "fail",
      detail: "AGENTS.md",
    },
  ];

  const blockedCount = checks.filter((check) => check.status === "fail").length;

  return {
    checks,
    blockedCount,
    warningCount: 0,
  };
}
