import { access } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

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
 * Locates a file at the monorepo root (e.g. `vercel.json`) whether the process
 * cwd is the repo root (Vercel) or `apps/erp` (local Next dev).
 */
export async function resolveRepoRootFile(
  relativePath: string,
): Promise<string> {
  const safeRelativePath = assertSafeRepoRelativePath(relativePath);
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const startDirs = [process.cwd(), join(moduleDir, "../../../../../../..")];

  for (const start of startDirs) {
    let dir = start;
    for (let depth = 0; depth < 8; depth += 1) {
      const candidate = join(dir, safeRelativePath);
      if (await fileExists(candidate)) {
        return candidate;
      }
      const parent = dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }

  throw new Error(
    `Could not locate ${safeRelativePath} from repository root (cwd=${process.cwd()}).`,
  );
}
