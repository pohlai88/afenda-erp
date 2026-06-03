#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): GUARD 1 — apps/erp/src may only contain
 * app/, routes/, kitchen-sinks/, instrumentation.ts, proxy.ts.
 * routes/ and kitchen-sinks/ must stay flat (no subdirectories).
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

const ALLOWED_TOP_LEVEL_DIRS = new Set(["app", "routes", "kitchen-sinks"]);
const FLAT_TOP_LEVEL_DIRS = new Set(["routes", "kitchen-sinks"]);
const ALLOWED_TOP_LEVEL_FILES = new Set([
  "apps/erp/src/instrumentation.ts",
  "apps/erp/src/proxy.ts",
]);

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
function guard1Violation(rel) {
  if (!rel.startsWith("apps/erp/src/")) return null;

  if (ALLOWED_TOP_LEVEL_FILES.has(rel)) return null;

  const remainder = rel.slice("apps/erp/src/".length);
  if (!remainder) return "apps/erp/src must not be written as a file.";

  const segments = remainder.split("/");
  const top = segments[0];

  if (segments.length === 1) {
    return `GUARD 1 blocks top-level apps/erp/src/${top}. Only instrumentation.ts and proxy.ts are allowed as root files. Put everything else in routes/ or kitchen-sinks/.`;
  }

  if (!ALLOWED_TOP_LEVEL_DIRS.has(top)) {
    return `GUARD 1 blocks apps/erp/src/${top}/. Only app/, routes/, and kitchen-sinks/ are allowed at apps/erp/src/. Move this into routes/ or kitchen-sinks/ (flat).`;
  }

  if (FLAT_TOP_LEVEL_DIRS.has(top) && segments.length > 2) {
    return `GUARD 1 blocks nested path apps/erp/src/${remainder}. ${top}/ must stay flat — use apps/erp/src/${top}/${segments.at(-1)} instead.`;
  }

  return null;
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
  const violation = guard1Violation(rel);
  if (!violation) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message: `Blocked: ${violation}`,
    agent_message: `${violation} Run pnpm guard:erp-src after fixing layout.`,
  });
}

main();
