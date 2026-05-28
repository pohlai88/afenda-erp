#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace):
 * Keep feature-package server markers centralized at the public ./server door.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);
const FEATURE_SOURCE = /^packages\/features\/[^/]+\/src\/.+\.(?:ts|tsx)$/;
const FEATURE_SERVER_DOOR =
  /^packages\/features\/[^/]+\/src\/server\.(?:ts|tsx)$/;
const DIRECT_SERVER_ONLY_IMPORT =
  /\bimport\s+(?:["']server-only["']|(?:[^"']+\s+from\s+)?["']server-only(?:\/index\.js)?["'])/;
const KERNEL_SERVER_IMPORT =
  /\bimport\s+(?:["']@afenda\/kernel\/server["']|(?:[^"']+\s+from\s+)?["']@afenda\/kernel\/server["'])/;

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
 * @param {unknown} input
 * @returns {string}
 */
function extractNewContent(input) {
  if (!input || typeof input !== "object") return "";
  const toolInput = /** @type {Record<string, unknown>} */ (input).tool_input;
  if (!toolInput || typeof toolInput !== "object") return "";

  const record = /** @type {Record<string, unknown>} */ (toolInput);
  return [record.contents, record.new_string]
    .filter((value) => typeof value === "string")
    .join("\n");
}

/**
 * @param {string} raw
 */
function normalizePath(raw) {
  return raw.replace(/\\/g, "/").replace(/^\.\//, "");
}

/**
 * @param {string} message
 */
function deny(message) {
  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message: message,
      agent_message: message,
    }),
  );
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

  const toolName = typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const rel = normalizePath(extractEditedPath(input));
  if (!FEATURE_SOURCE.test(rel)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const content = extractNewContent(input);
  if (!content) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  if (DIRECT_SERVER_ONLY_IMPORT.test(content)) {
    deny(
      'Feature packages must not import server-only directly. Put the boundary marker in src/server.ts via import "@afenda/kernel/server".',
    );
  }

  if (!FEATURE_SERVER_DOOR.test(rel) && KERNEL_SERVER_IMPORT.test(content)) {
    deny(
      "Feature internals must not import @afenda/kernel/server directly. Keep the server boundary marker in the package src/server.ts door.",
    );
  }

  process.stdout.write('{"permission":"allow"}');
}

main();
