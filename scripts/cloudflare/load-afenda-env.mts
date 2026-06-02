import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadAfendaEnv() {
  for (const file of [".env.config", ".env.local", "apps/erp/.env.local"]) {
    config({ path: resolve(rootDir, file), override: false });
  }
  config({ path: resolve(rootDir, ".secret.config"), override: true });
  return rootDir;
}
