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

function parseDotenv(content) {
  /** @type {Record<string, string>} */
  const env = {};

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

function formatEnvValue(value) {
  if (value === "") return "";
  if (/[\r\n#"'\s\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

async function main() {
  const sourceRaw = await readFile(sourcePath, "utf8");
  const source = sourceRaw.replace(/^\uFEFF/, "");
  const normalizedSource = source.endsWith("\n") ? source : `${source}\n`;
  const parsedSource = parseDotenv(source);
  const sourceKeys = new Set(Object.keys(parsedSource));

  const outputs = new Map();
  const banner = `# Generated from .env.config via pnpm env:sync.
# Edit .env.config and re-run the sync script.

`;

  for (const targetPath of targetPaths) {
    let preserved = {};

    try {
      const existing = await readFile(targetPath, "utf8");
      const parsedExisting = parseDotenv(existing);
      preserved = Object.fromEntries(
        Object.entries(parsedExisting).filter(([key]) => !sourceKeys.has(key)),
      );
    } catch {
      preserved = {};
    }

    let output = `${banner}${normalizedSource}`;
    const preservedEntries = Object.entries(preserved);
    if (preservedEntries.length > 0) {
      output += `\n# --- Not in .env.config (kept from previous ${targetPath.endsWith(".env.local") ? ".env.local" : "env file"}) ---\n`;
      output += `${preservedEntries
        .map(([key, value]) => `${key}=${formatEnvValue(value)}`)
        .join("\n")}\n`;
    }

    outputs.set(targetPath, output);
  }

  if (dryRun) {
    for (const [targetPath, output] of outputs) {
      process.stdout.write(`--- ${targetPath} ---\n${output}`);
    }
    return;
  }

  for (const [targetPath, output] of outputs) {
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
}

main().catch((error) => {
  process.stderr.write(
    `Unable to synchronize environment files. Ensure .env.config exists. ${String(error)}\n`,
  );
  process.exitCode = 1;
});
