#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): GUARD 3 — kitchen-sinks files must be
 * {topic}.{role}.ts with role in run|contract|redirect|metadata|helper.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

const FAIL_BANNER = "YOU MOTHER FUCKER AI, READ THE RULES!!!";

const KITCHEN_SINK_FILE_PATTERN =
  /^[a-z][a-z0-9-]*\.(run|contract|redirect|metadata|helper)\.ts$/;

const EXAMPLES = [
  "cron.run.ts",
  "erp-http.contract.ts",
  "auth-dev-sign-in.redirect.ts",
  "module-feature.metadata.ts",
];

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

/**
 * @param {string} rel
 * @returns {string | null}
 */
function guard3Violation(rel) {
  const prefix = "apps/erp/src/kitchen-sinks/";
  if (!rel.startsWith(prefix)) return null;

  const remainder = rel.slice(prefix.length);
  if (!remainder || remainder.includes("/")) {
    return `GUARD 3 blocks nested kitchen-sinks path. Keep files flat. ${FAIL_BANNER}`;
  }

  if (KITCHEN_SINK_FILE_PATTERN.test(remainder)) return null;

  return `GUARD 3 blocks "${remainder}". Use {topic}.{role}.ts — role: run|contract|redirect|metadata|helper. Examples: ${EXAMPLES.join(", ")}. ${FAIL_BANNER} See .cursor/hooks/afenda-guard-kitchen-sinks.md`;
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
  const violation = guard3Violation(rel);
  if (!violation) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message: `Blocked: ${violation}`,
    agent_message: `${violation} Run pnpm guard:kitchen-sinks after fixing the name.`,
  });
}

main();
