#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): GUARD 2 — apps/erp/src/app top level may only
 * contain (auth)/, (workspace)/, api/, onboarding/, and Next.js root route files.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

const FAIL_BANNER = "FUCK, READ the RULES!!";

const ALLOWED_TOP_LEVEL_DIRS = new Set([
  "(auth)",
  "(workspace)",
  "api",
  "onboarding",
]);

const ALLOWED_TOP_LEVEL_FILES = new Set([
  "default.tsx",
  "error.tsx",
  "favicon.ico",
  "forbidden.tsx",
  "global-error.tsx",
  "globals.css",
  "layout.tsx",
  "loading.tsx",
  "not-found.tsx",
  "page.tsx",
  "template.tsx",
  "unauthorized.tsx",
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
function guard2Violation(rel) {
  const prefix = "apps/erp/src/app/";
  if (!rel.startsWith(prefix)) return null;

  const remainder = rel.slice(prefix.length);
  if (!remainder) {
    return "apps/erp/src/app must not be written as a file.";
  }

  const segments = remainder.split("/");
  const top = segments[0];

  if (segments.length === 1) {
    if (ALLOWED_TOP_LEVEL_FILES.has(top)) return null;
    return `GUARD 2 blocks top-level apps/erp/src/app/${top}. Only Next.js root route files are allowed at app root. ${FAIL_BANNER} See .cursor/hooks/afenda-guard-erp-app.md`;
  }

  if (!ALLOWED_TOP_LEVEL_DIRS.has(top)) {
    return `GUARD 2 blocks apps/erp/src/app/${top}/. Only (auth)/, (workspace)/, api/, and onboarding/ are allowed at app root. ${FAIL_BANNER} Move composers to routes/ or kitchen-sinks/.`;
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
  const violation = guard2Violation(rel);
  if (!violation) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message: `Blocked: ${violation}`,
    agent_message: `${violation} Run pnpm guard:erp-app after fixing layout.`,
  });
}

main();
