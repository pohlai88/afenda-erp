#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): block @afenda/feature-* imports inside @afenda/kernel.
 * ARCH-002 §3 — fail closed; no human review required.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);
const KERNEL_PATH = /^packages\/kernel\//;
const FEATURE_IMPORT =
  /\bfrom\s+["']@afenda\/feature-[^"']+["']|\bimport\s+["']@afenda\/feature-[^"']+["']/;
const APP_IMPORT =
  /\bfrom\s+["'](@afenda\/erp[^"']*|apps\/erp[^"']*)["']|\bimport\s+["'](@afenda\/erp[^"']*|apps\/erp[^"']*)["']/;

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
 * @param {unknown} input
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
  if (!rel || !KERNEL_PATH.test(rel)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const content = extractNewContent(input);
  if (content && FEATURE_IMPORT.test(content)) {
    deny(
      `Blocked: ${rel} cannot import @afenda/feature-* (ARCH-002 §3). Feature logic stays in feature packages; kernel keeps execution-law only.`,
    );
  }

  if (content && APP_IMPORT.test(content)) {
    deny(
      `Blocked: ${rel} cannot import apps/erp or @afenda/erp (ARCH-002 §3). The app composes kernel — not the reverse.`,
    );
  }

  process.stdout.write('{"permission":"allow"}');
}

main();
