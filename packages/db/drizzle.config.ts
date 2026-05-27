import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(packageDir, "../../.env.local") });
config({ path: resolve(packageDir, "../../.env.config"), override: false });

const migrationUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_MIGRATION_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_URL before using drizzle-kit.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: migrationUrl,
  },
});
