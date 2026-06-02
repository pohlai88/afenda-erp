#!/usr/bin/env node
/**
 * preToolUse (Write | StrReplace): fail closed on target-architecture violations.
 * ARCH-1004 §7 · ARCH-1001 authority · no flat /api/* · no lazy doc rollback.
 * object-storage: ONLY src/{blob,r2,_object-storage-integration}/ + export doors.
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

const OBJECT_STORAGE_SRC = /^packages\/object-storage\/src(?:\/|$)/;

const OBJECT_STORAGE_ALLOWED_ROOT = new Set([
  "packages/object-storage/src/index.ts",
  "packages/object-storage/src/client.ts",
  "packages/object-storage/src/server.ts",
  "packages/object-storage/src/metadata.ts",
]);

const OBJECT_STORAGE_ALLOWED_TOP = new Set([
  "blob",
  "r2",
  "_object-storage-integration",
]);

const OBJECT_STORAGE_PROVIDER_BUCKETS = new Set(["api", "domain"]);

const OBJECT_STORAGE_TEMPLATE_BUCKETS = new Set([
  "actions",
  "commands",
  "api",
  "contracts",
  "components",
  "data",
  "domain",
  "events",
  "policies",
  "read-models",
  "schemas",
  "tests",
]);

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
      agent_message: `${message} object-storage law: src/ allows ONLY blob/, r2/, _object-storage-integration/ (+ index.ts, client.ts, server.ts, metadata.ts).`,
    }),
  );
  process.exit(2);
}

/**
 * @param {string} rel
 */
function checkObjectStorageLayout(rel) {
  if (!OBJECT_STORAGE_SRC.test(rel)) {
    return;
  }

  if (
    rel.startsWith("packages/object-storage/r2/") ||
    rel === "packages/object-storage/r2"
  ) {
    deny(
      `Blocked: ${rel} — forbidden package-root r2/. Use packages/object-storage/src/r2/ (e.g. policies/cors.json).`,
    );
  }

  if (rel === "packages/object-storage/src") {
    return;
  }

  const afterSrc = rel.replace(/^packages\/object-storage\/src\/?/, "");
  if (!afterSrc) {
    return;
  }

  const segments = afterSrc.split("/");
  const top = segments[0] ?? "";

  if (segments.length === 1 && afterSrc.includes(".")) {
    if (!OBJECT_STORAGE_ALLOWED_ROOT.has(rel)) {
      deny(
        `Blocked: ${rel} — forbidden file at object-storage src root. Only index.ts, client.ts, server.ts, metadata.ts allowed. Move code into _object-storage-integration/, blob/, or r2/.`,
      );
    }
    return;
  }

  if (!OBJECT_STORAGE_ALLOWED_TOP.has(top)) {
    deny(
      `Blocked: ${rel} — forbidden top-level folder "${top}/". object-storage src/ allows ONLY blob/, r2/, _object-storage-integration/.`,
    );
  }

  if (
    rel.includes("/_object-storage-integration/auth/") ||
    rel.includes("/_object-storage-integration/env/") ||
    rel.includes("/_object-storage-integration/errors/") ||
    rel.includes("/_object-storage-integration/client/")
  ) {
    deny(
      `Blocked: ${rel} — non-ARCH bucket. Use domain/, components/, schemas/ per ARCH-1002 §8.`,
    );
  }

  if (top === "blob" || top === "r2" || top === "_object-storage-integration") {
    // Bucket names are directories — never files (e.g. src/.../components with no extension).
    if (segments.length === 2 && segments[1] && !segments[1].includes(".")) {
      deny(
        `Blocked: ${rel} — "${segments[1]}" must be a template bucket directory, not a file. Use ${segments[1]}/<module>.ts inside the slice.`,
      );
    }

    if (segments.length >= 2) {
      const bucket = segments[1] ?? "";
      if (bucket && !OBJECT_STORAGE_TEMPLATE_BUCKETS.has(bucket)) {
        deny(
          `Blocked: ${rel} — "${bucket}/" is not an ARCH-1002 §8 template bucket.`,
        );
      }
    }
  }
}

/**
 * @param {string} rel
 * @param {string} content
 */
function checkObjectStorageDbImport(rel, content, fileBody) {
  const body = content || fileBody || "";
  if (
    rel.startsWith("packages/object-storage/src/") &&
    rel.includes("/api/") &&
    rel.endsWith(".ts") &&
    body.includes("@afenda/db")
  ) {
    deny(
      `Blocked: ${rel} — api handlers must not import @afenda/db (ARCH-1004 §7). Inject getTenantDocument from apps/erp route via ObjectStorageDownloadHandlerDeps.`,
    );
  }
}

/**
 * @param {string} rel
 * @param {string} content
 */
function checkPath(rel, content) {
  checkObjectStorageLayout(rel);

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

  const hookDir = dirname(fileURLToPath(import.meta.url));
  const root = join(hookDir, "..", "..");
  const abs = join(root, rel);
  let fileBody = "";
  if (existsSync(abs)) {
    try {
      fileBody = readFileSync(abs, "utf8");
    } catch {
      fileBody = "";
    }
  }
  checkObjectStorageDbImport(rel, content, fileBody);

  process.stdout.write('{"permission":"allow"}');
}

main();
