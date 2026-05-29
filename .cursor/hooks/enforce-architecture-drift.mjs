#!/usr/bin/env node
/**
 * postToolUse (Write | StrReplace): run drift guards for the edited path.
 * Fails the agent turn via additional_context — do not ask the user to run pnpm manually.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);
const hookDir = dirname(fileURLToPath(import.meta.url));
const root = join(hookDir, "..", "..");

/**
 * @param {unknown} input
 */
function extractEditedPath(input) {
  if (!input || typeof input !== "object") return "";
  const toolInput = /** @type {Record<string, unknown>} */ (input).tool_input;
  if (!toolInput || typeof toolInput !== "object") return "";

  const record = /** @type {Record<string, unknown>} */ (toolInput);
  const candidate =
    record.path ?? record.file_path ?? record.target_file ?? record.filePath;
  return typeof candidate === "string" ? candidate : "";
}

/**
 * @param {string} raw
 */
function normalizePath(raw) {
  return raw.replace(/\\/g, "/").replace(/^\.\//, "");
}

function main() {
  let input = {};
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    process.stdout.write("{}");
    return;
  }

  const toolName = typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write("{}");
    return;
  }

  const rel = normalizePath(extractEditedPath(input));
  if (!rel) {
    process.stdout.write("{}");
    return;
  }

  const script = join(root, "scripts", "enforce-architecture-drift.mts");
  if (!existsSync(script)) {
    process.stdout.write("{}");
    return;
  }

  const result = spawnSync(
    "pnpm",
    ["exec", "tsx", script, "--path", rel],
    {
      cwd: root,
      encoding: "utf8",
      shell: process.platform === "win32",
      env: process.env,
    },
  );

  if (result.status === 0) {
    process.stdout.write("{}");
    return;
  }

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();

  const additional_context = [
    "<!-- afenda-drift-enforcement: FAILED -->",
    `**Automatic architecture drift check failed** after editing \`${rel}\`.`,
    "Fix the violations below in this session. **Do not ask the user to run checks** — hooks and CI enforce this.",
    "",
    "```text",
    output || `pnpm exec tsx scripts/enforce-architecture-drift.mts --path ${rel} (exit ${result.status})`,
    "```",
  ].join("\n");

  process.stdout.write(JSON.stringify({ additional_context }));
}

main();
