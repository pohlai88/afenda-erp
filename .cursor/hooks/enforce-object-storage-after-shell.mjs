#!/usr/bin/env node
/**
 * postToolUse (Shell): run layout:check when shell touched object-storage.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const hookDir = dirname(fileURLToPath(import.meta.url));
const root = join(hookDir, "..", "..");

/**
 * @param {unknown} input
 */
function extractCommand(input) {
  if (!input || typeof input !== "object") return "";
  const record = /** @type {Record<string, unknown>} */ (input);
  if (typeof record.command === "string") return record.command;
  const toolInput = record.tool_input;
  if (toolInput && typeof toolInput === "object") {
    const cmd = /** @type {Record<string, unknown>} */ (toolInput).command;
    if (typeof cmd === "string") return cmd;
  }
  return "";
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
  if (toolName !== "Shell") {
    process.stdout.write("{}");
    return;
  }

  const command = extractCommand(input);
  if (!/packages\/object-storage/i.test(command.replace(/\\/g, "/"))) {
    process.stdout.write("{}");
    return;
  }

  const script = join(
    root,
    "packages/object-storage/scripts/check-object-storage-layout.mts",
  );
  if (!existsSync(script)) {
    process.stdout.write("{}");
    return;
  }

  const result = spawnSync("pnpm", ["exec", "tsx", script], {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (result.status === 0) {
    process.stdout.write("{}");
    return;
  }

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  process.stdout.write(
    JSON.stringify({
      additional_context: [
        "<!-- afenda-object-storage-shell: FAILED -->",
        "Shell command touched `packages/object-storage/` but **layout:check failed**.",
        "Fix before continuing. Do not claim compliance.",
        "",
        "```text",
        output || `layout:check exit ${result.status}`,
        "```",
      ].join("\n"),
    }),
  );
}

main();
