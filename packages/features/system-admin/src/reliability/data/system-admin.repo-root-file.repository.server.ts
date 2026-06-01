import { access } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../..",
);

const repoRootFiles = {
  "AGENTS.md": join(repoRoot, "AGENTS.md"),
  "docs/architecture/README.md": join(
    repoRoot,
    "docs",
    "architecture",
    "README.md",
  ),
  "packages/db/drizzle": join(repoRoot, "packages", "db", "drizzle"),
  "packages/db/drizzle/meta/_journal.json": join(
    repoRoot,
    "packages",
    "db",
    "drizzle",
    "meta",
    "_journal.json",
  ),
  "scripts/check-directory-architecture.mts": join(
    repoRoot,
    "scripts",
    "check-directory-architecture.mts",
  ),
  "vercel.json": join(repoRoot, "vercel.json"),
} as const satisfies Record<string, string>;

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function assertSafeRepoRelativePath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);

  if (
    !normalized ||
    isAbsolute(relativePath) ||
    parts.some((part) => part === "..")
  ) {
    throw new Error(`Unsafe repository relative path: ${relativePath}`);
  }

  return normalized;
}

/**
 * Locates reliability-audit files at the monorepo root.
 *
 * Keep this resolver allowlisted. Dynamic upward walks from `process.cwd()` make
 * Turbopack's file tracer conservatively include the whole repository.
 */
export async function resolveRepoRootFile(
  relativePath: string,
): Promise<string> {
  const safeRelativePath = assertSafeRepoRelativePath(relativePath);
  const candidate =
    repoRootFiles[safeRelativePath as keyof typeof repoRootFiles];

  if (!candidate) {
    throw new Error(`Repository path is not allowlisted: ${safeRelativePath}`);
  }

  if (await fileExists(candidate)) {
    return candidate;
  }

  throw new Error(`Could not locate ${safeRelativePath} from repository root.`);
}
