#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): fail closed on target-architecture violations.
 * ARCH-1004 §7 · ARCH-1001 authority · no flat /api/* · no lazy doc rollback.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

/** Flat ingress paths — non-compliant per ARCH-1004 §2, §7 */
const FLAT_API_SEGMENT =
  /^apps\/erp\/src\/app\/api\/(lynx|ai|cron|uploads)(?:\/|$)/;

const ALLOWED_API_PREFIX =
  /^apps\/erp\/src\/app\/api\/(auth\/|internal\/|public\/)/;

const ARCH_DOC = /^docs\/architecture\/.*\.md$/i;

const LAZY_DOC_PHRASES = [
  /\bas-built\s+vs\s+target\b/i,
  /\bmigrate\s+when\s+touched\b/i,
  /\bas-built\s+ok\b/i,
  /\btolerated\s+until\s+migrat/i,
  /\buntil\s+`packages\/api`\s+exists\b/i,
  /\blegacy\s+mode\b/i,
  /\boptional\s+migration\s+later\b/i,
  /\bgood\s+enough\s+for\s+now\b/i,
  /\bno\s+need\s+to\s+migrat/i,
  /\*\*As-built:\*\*/i,
  /\bcompliance\s+theater\b/i,
];

const APP_ROUTE = /^apps\/erp\/src\/app\/api\/.*\/route\.ts$/;

const APP_LIB_API = /^apps\/erp\/src\/lib\/api\/.*\.ts$/;

const FORBIDDEN_ROUTE_IMPORTS = [
  /\bfrom\s+["']@afenda\/db["']/,
  /\brecordLynxRunFeedback\b/,
  /\bgetLynxRunDetail\b/,
  /\bstreamText\s*\(/,
  /\bcreateLynxRun\s*\(/,
];

const FORBIDDEN_LIB_API = [
  /\bfrom\s+["']@afenda\/db["']/,
  /\blynxOperatorRequestSchema\b/,
  /\bparseLynxRunFilters\b/,
  /\bbuildLynxTruthSystemPrompt\b/,
];

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
      agent_message: `${message} See rule afenda-agent-discipline and ARCH-1004 §7.`,
    }),
  );
  process.exit(2);
}

/**
 * @param {string} rel
 * @param {string} content
 */
function checkPath(rel, content) {
  if (ARCH_DOC.test(rel) && content) {
    for (const pattern of LAZY_DOC_PHRASES) {
      if (pattern.test(content)) {
        deny(
          `Blocked: ${rel} reintroduces lazy-doc language (${pattern}). ARCH docs are target-only; use §7 Non-compliance instead of "as-built vs target."`,
        );
      }
    }
  }

  if (FLAT_API_SEGMENT.test(rel) && !ALLOWED_API_PREFIX.test(rel)) {
    deny(
      `Blocked: ${rel} uses flat /api/<module> (non-compliant). Required: apps/erp/src/app/api/internal/v1/... per ARCH-1004 §2, §5, §7.`,
    );
  }

  if (APP_LIB_API.test(rel) && content) {
    for (const pattern of FORBIDDEN_LIB_API) {
      if (pattern.test(content)) {
        deny(
          `Blocked: ${rel} puts module API logic in apps/erp/src/lib/api/. Use packages/features/<module>/schemas|api|commands per ARCH-1004 §3.`,
        );
      }
    }
  }

  const hookDir = dirname(fileURLToPath(import.meta.url));
  const root = join(hookDir, "..", "..");
  const abs = join(root, rel);

  let body = content;
  if (!body && existsSync(abs)) {
    try {
      body = readFileSync(abs, "utf8");
    } catch {
      body = "";
    }
  }

  if (APP_ROUTE.test(rel) && body) {
    for (const pattern of FORBIDDEN_ROUTE_IMPORTS) {
      if (pattern.test(body)) {
        deny(
          `Blocked: ${rel} must be a thin transport (ARCH-1004 §3). Move @afenda/db / streamText / Lynx persistence to @afenda/feature-*/server (commands, api handlers, read-models).`,
        );
      }
    }
    const lineCount = body.split("\n").length;
    if (lineCount > 25 && /\bexport\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/.test(body)) {
      deny(
        `Blocked: ${rel} is ${lineCount} lines — fat route (ARCH-1004 §3). Delegate to feature api handler or @afenda/api withApiHandler; keep route ≤15 lines.`,
      );
    }
  }
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
  if (!rel) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const content = extractNewContent(input);
  checkPath(rel, content);

  process.stdout.write('{"permission":"allow"}');
}

main();
