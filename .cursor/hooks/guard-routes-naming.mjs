#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): GUARD 4 — routes/ filenames must include
 * -route or start with route-.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

const FAIL_BANNER = "YOU DAMN SON OF BITH AI, READ THE RULES!!!!";

const ROUTES_FILE_PATTERN =
  /^(?:route-[a-z0-9-]+|[a-z0-9-]+-route(?:-[a-z0-9-]+)?)(?:\.[a-z0-9-]+)*\.(?:tsx|ts)$/;

const EXAMPLES = [
  "lynx-console-route.server.tsx",
  "execution-context-route.server.ts",
  "auth-route-fallback.tsx",
  "route-state.client.tsx",
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
function guard4Violation(rel) {
  const prefix = "apps/erp/src/routes/";
  if (!rel.startsWith(prefix)) return null;

  const remainder = rel.slice(prefix.length);
  if (!remainder) {
    return `GUARD 4 blocks writing apps/erp/src/routes as a file. ${FAIL_BANNER}`;
  }

  if (remainder.includes("/")) {
    return `GUARD 4 blocks nested routes path. Keep routes/ flat. ${FAIL_BANNER}`;
  }

  if (ROUTES_FILE_PATTERN.test(remainder)) return null;

  return `GUARD 4 blocks "${remainder}". Use {topic}-route.{artifact}.{ext} or route-{topic}.{ext}. Examples: ${EXAMPLES.join(", ")}. ${FAIL_BANNER} See .cursor/hooks/afenda-guard-routes.md`;
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
  const violation = guard4Violation(rel);
  if (!violation) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message: `Blocked: ${violation}`,
    agent_message: `${violation} Run pnpm guard:routes after fixing the name.`,
  });
}

main();
