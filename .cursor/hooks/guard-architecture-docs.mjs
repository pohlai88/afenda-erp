#!/usr/bin/env node
/**
 * preToolUse (Delete): block agent deletion of architecture doctrine files.
 */
import { readFileSync } from "node:fs";

const DELETE_TOOL = "Delete";

const EXPLICIT_OVERRIDE =
  /\b(explicitly|delete (?:the )?(?:architecture|arch) doc|remove (?:the )?(?:architecture|arch) doc|delete .{0,80}architecture)\b/i;

const ARCHITECTURE_PATH =
  /(^|\/)docs\/architecture\/|architecture[^/]*\.md$|-architecture\.md$/i;

/**
 * @param {unknown} input
 */
function hasExplicitOverride(input) {
  return EXPLICIT_OVERRIDE.test(JSON.stringify(input));
}

/**
 * @param {unknown} input
 * @returns {string}
 */
function extractPath(input) {
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

  const record = /** @type {Record<string, unknown>} */ (input);
  const toolName =
    typeof record.tool_name === "string" ? record.tool_name : "";

  if (toolName !== DELETE_TOOL) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  if (hasExplicitOverride(record)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const rel = normalizePath(extractPath(record));
  if (!rel || !ARCHITECTURE_PATH.test(rel)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message:
      "Blocked: agents must not delete architecture doctrine files. Update docs in place or ask the user to explicitly authorize deletion.",
    agent_message:
      `Do not delete \`${rel}\`. Architecture docs (paths containing "architecture") must be preserved — edit and cross-link instead. Override only when the user explicitly requested deleting this architecture doc in the current turn. See rule afenda-architecture-docs.`,
  });
}

main();
