#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace):
 * Block root paths that collide with .artifacts/ or commit local debug dumps.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

/** Root paths agents must not create (test output uses .artifacts/; reports use docs/). */
const BLOCKED_ROOT_PATH =
  /^(?:artifacts(?:\/.*)?|build-log\.txt|dashboard-snapshot\.ya?ml|page-[\dT:-]+Z\.ya?ml)$/i;

/**
 * @param {unknown} input
 * @returns {string}
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

/**
 * @param {{ permission: string; user_message: string; agent_message: string }} payload
 */
function deny(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(2);
}

function main() {
  let input = {};
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const toolName =
    typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const rel = normalizePath(extractEditedPath(input));
  if (!rel || !BLOCKED_ROOT_PATH.test(rel)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  if (/^artifacts(?:\/|$)/i.test(rel)) {
    deny({
      permission: "deny",
      user_message:
        'Blocked: root "artifacts/" collides with gitignored ".artifacts/" (test output). Use docs/testing/ for audit reports or pnpm artifacts:init for runner output.',
      agent_message:
        'Do not create repo-root artifacts/. Generated test output belongs in .artifacts/ (pnpm artifacts:init). Committed audit baselines belong under docs/testing/ or packages/ui/audits/.',
    });
  }

  deny({
    permission: "deny",
    user_message:
      "Blocked: local debug dump at repo root. Use .artifacts/logs/ or docs/testing/ instead.",
    agent_message:
      "Do not write build-log.txt, dashboard-snapshot.yml, or Playwright MCP page dumps at the repo root. Logs → .artifacts/logs/; audit matrices → docs/testing/.",
  });
}

main();
