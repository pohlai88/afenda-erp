import { resolveMigrationDatabaseUrl } from "@afenda/config/env";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(packageDir, "../../.env.local") });
config({ path: resolve(packageDir, "../../.env.config"), override: false });
config({ path: resolve(packageDir, "../../.secret.config"), override: true });

const migrationUrl = resolveMigrationDatabaseUrl(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: migrationUrl,
  },
});
