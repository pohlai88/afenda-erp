import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(rootDir, ".env.config");
const targetPaths = [
  resolve(rootDir, ".env.local"),
  resolve(rootDir, "apps/erp/.env.local"),
];
const dryRun = process.argv.includes("--dry-run");

/** Keys dropped from preserved target sections (removed from `.env.config` / MCP). */
const STALE_PRESERVED_ENV_KEYS = new Set(["CONTEXT7_API_KEY"]);

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

function formatEnvValue(value: string) {
  if (value === "") return "";
  if (/[\r\n#"'\s\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Ensures `VERCEL_API_TOKEN` is present locally for Gateway billing reads. */
function buildAiGatewayAliasBlock(parsed: Record<string, string>) {
  if (parsed.VERCEL_API_TOKEN?.trim()) {
    return "";
  }

  const aliasValue = parsed.AI_GATEWAY_API_KEY?.trim();
  if (!aliasValue) {
    return "";
  }

  const source = "AI_GATEWAY_API_KEY";

  return `\n# --- Aliased by pnpm env:sync (Gateway billing expects VERCEL_API_TOKEN) ---\n# Source: ${source}\nVERCEL_API_TOKEN=${formatEnvValue(aliasValue)}\n`;
}

/** Dry-run must not echo secrets from `.env.config` to the terminal. */
function redactEnvFileContent(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      const equalsIndex = line.indexOf("=");
      if (equalsIndex <= 0) return line;

      const key = line.slice(0, equalsIndex);
      const value = line.slice(equalsIndex + 1).trim();
      if (value === "") return `${key}=`;
      return `${key}=<redacted>`;
    })
    .join("\n");
}

async function main() {
  const sourceRaw = await readFile(sourcePath, "utf8");
  const source = sourceRaw.replace(/^\uFEFF/, "");
  const normalizedSource = source.endsWith("\n") ? source : `${source}\n`;
  const parsedSource = parseDotenv(source);
  const sourceKeys = new Set(Object.keys(parsedSource));

  const outputs = new Map<
    string,
    { content: string; preservedKeys: string[] }
  >();
  const banner = `# Generated from .env.config via pnpm env:sync.
# Edit .env.config and re-run the sync script.

`;

  for (const targetPath of targetPaths) {
    let preserved: Record<string, string> = {};

    try {
      const existing = await readFile(targetPath, "utf8");
      const parsedExisting = parseDotenv(existing);
      preserved = Object.fromEntries(
        Object.entries(parsedExisting).filter(
          ([key]) =>
            !sourceKeys.has(key) && !STALE_PRESERVED_ENV_KEYS.has(key),
        ),
      );
    } catch {
      preserved = {};
    }

    let output = `${banner}${normalizedSource}${buildAiGatewayAliasBlock(parsedSource)}`;
    const preservedEntries = Object.entries(preserved);
    if (preservedEntries.length > 0) {
      output += `\n# --- Not in .env.config (kept from previous ${targetPath.endsWith(".env.local") ? ".env.local" : "env file"}) ---\n`;
      output += `${preservedEntries
        .map(([key, value]) => `${key}=${formatEnvValue(value)}`)
        .join("\n")}\n`;
    }

    outputs.set(targetPath, {
      content: output,
      preservedKeys: preservedEntries.map(([key]) => key),
    });
  }

  if (dryRun) {
    for (const [targetPath, { content, preservedKeys }] of outputs) {
      process.stdout.write(
        `--- ${targetPath} ---\n` +
          `Would sync ${sourceKeys.size} key(s) from .env.config` +
          (preservedKeys.length > 0
            ? `; preserve ${preservedKeys.length} key(s) not in source: ${preservedKeys.join(", ")}`
            : "") +
          ".\n",
      );
      process.stdout.write(`${redactEnvFileContent(content)}\n`);
    }
    return;
  }

  for (const [targetPath, { content: output }] of outputs) {
    await mkdir(dirname(targetPath), { recursive: true });

    try {
      const existing = await readFile(targetPath, "utf8");
      if (existing === output) continue;
    } catch {
      // File does not exist yet.
    }

    await writeFile(targetPath, output, "utf8");
  }

  process.stdout.write(
    `Synchronized environment files from ${sourcePath} to ${targetPaths.length} target(s).\n`,
  );
  process.stdout.write(
    "For Cursor MCP on Windows, run: pnpm env:sync:cursor (then restart Cursor).\n",
  );
}

main().catch((error) => {
  process.stderr.write(
    `Unable to synchronize environment files. Ensure .env.config exists. ${String(error)}\n`,
  );
  process.exitCode = 1;
});
