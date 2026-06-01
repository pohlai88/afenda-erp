import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ENV_FILES = [
  ".env.config",
  ".env.local",
  "apps/erp/.env.local",
  ".secret.config",
] as const;

/** Load repo env files in Afenda precedence order (secrets override). */
export function loadRootEnv(): void {
  for (const file of ENV_FILES) {
    const path = resolve(rootDir, file);
    if (!existsSync(path)) continue;
    config({ path, override: file === ".secret.config" });
  }
}

export function getRootDir(): string {
  return rootDir;
}
