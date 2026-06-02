import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configSourcePath = resolve(rootDir, ".env.config");
const secretSourcePath = resolve(rootDir, ".secret.config");

/** Keys referenced by ~/.cursor/mcp.json via ${env:…} */
const CURSOR_USER_ENV_KEYS = [
  "NEON_API_KEY",
  "GITHUB_TOKEN",
  "CONTEXT7_API_KEY",
  "CLOUDFLARE_API_TOKEN",
] as const;

function parseDotenv(content: string) {
  const env: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value.replace(/^\uFEFF/, "").trim();
  }

  return env;
}

async function readOptionalDotenv(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function setWindowsUserEnv(key: string, value: string) {
  const script = [
    `$value = @'
${value.replace(/'/g, "''")}
'@`,
    `[Environment]::SetEnvironmentVariable('${key}', $value, 'User')`,
  ].join("\n");

  execFileSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { stdio: "pipe" },
  );
}

async function main() {
  if (process.platform !== "win32") {
    process.stdout.write(
      "env:sync:cursor is Windows-only (Cursor reads User environment variables). On macOS/Linux, export the same keys in your shell profile.\n",
    );
    return;
  }

  const configRaw = await readFile(configSourcePath, "utf8");
  const secretRaw = await readOptionalDotenv(secretSourcePath);
  const parsed = {
    ...parseDotenv(configRaw.replace(/^\uFEFF/, "")),
    ...parseDotenv(secretRaw.replace(/^\uFEFF/, "")),
  };

  const updated: string[] = [];
  const skipped: string[] = [];

  for (const key of CURSOR_USER_ENV_KEYS) {
    const value = parsed[key];
    if (!value) {
      skipped.push(key);
      continue;
    }

    setWindowsUserEnv(key, value);
    updated.push(key);
  }

  if (updated.length > 0) {
    process.stdout.write(`Set Windows User env: ${updated.join(", ")}\n`);
  }
  if (skipped.length > 0) {
    process.stdout.write(
      `Skipped (empty in .env.config + .secret.config): ${skipped.join(", ")}\n`,
    );
  }

  process.stdout.write(
    "Restart Cursor completely so MCP servers pick up User env changes.\n",
  );
}

main().catch((error) => {
  process.stderr.write(
    `Unable to sync Cursor MCP env from .env.config + .secret.config. ${String(error)}\n`,
  );
  process.exitCode = 1;
});
