#!/usr/bin/env node
/**
 * preToolUse / beforeShellExecution / beforeMCPExecution:
 * Block agent-authored DDL outside Drizzle generate → migrate workflow.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);
const MIGRATION_SQL = /^packages\/db\/drizzle\/[^/]+\.sql$/;
const SCHEMA_TS = /^packages\/db\/src\/schema\/.+\.ts$/;

const EXPLICIT_OVERRIDE =
  /\b(explicitly|manual(?:ly)?|hand[- ]?writ(?:e|ten)|edit (?:the )?migration sql|hotfix migration|run this ddl|author (?:the )?migration sql)\b/i;

const DDL_PATTERN =
  /\b(create\s+(?:or\s+replace\s+)?(?:table|type|index|extension|schema)|alter\s+table|drop\s+(?:table|type|schema|index)|truncate\s+table)\b/i;

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
 * @param {unknown} input
 * @returns {string}
 */
function extractWriteContent(input) {
  if (!input || typeof input !== "object") return "";
  const toolInput = /** @type {Record<string, unknown>} */ (input).tool_input;
  if (!toolInput || typeof toolInput !== "object") return "";

  const record = /** @type {Record<string, unknown>} */ (toolInput);
  return [record.contents, record.new_string, record.old_string]
    .filter((v) => typeof v === "string")
    .join("\n");
}

/**
 * @param {{ permission: string; user_message: string; agent_message: string }} payload
 */
function deny(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(2);
}

/**
 * @param {{ permission: string; user_message: string; agent_message: string }} payload
 */
function ask(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

/**
 * @param {Record<string, unknown>} input
 */
function handlePreToolUse(input) {
  const toolName =
    typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) return;

  const rel = normalizePath(extractEditedPath(input));
  if (!rel || hasExplicitOverride(input)) return;

  if (MIGRATION_SQL.test(rel)) {
    deny({
      permission: "deny",
      user_message:
        "Blocked: agents must not edit generated migration SQL. Change packages/db/src/schema, then run pnpm db:generate and pnpm db:migrate.",
      agent_message:
        "Do not edit packages/db/drizzle/*.sql. Edit src/schema, run pnpm db:generate, review SQL, then pnpm db:migrate. Override only if the user explicitly requested hand-written migration SQL this turn.",
    });
  }

  if (SCHEMA_TS.test(rel) && DDL_PATTERN.test(extractWriteContent(input))) {
    deny({
      permission: "deny",
      user_message:
        "Blocked: raw DDL inside schema TypeScript. Use Drizzle column/table APIs, then pnpm db:generate.",
      agent_message:
        "Schema files must use drizzle-orm definitions (pgTable, pgEnum, etc.), not embedded CREATE/ALTER SQL. Run pnpm db:generate after schema edits.",
    });
  }
}

/**
 * @param {Record<string, unknown>} input
 */
function handleShell(input) {
  const command = typeof input.command === "string" ? input.command : "";
  if (!command || hasExplicitOverride(input)) return;

  if (/\bpnpm\s+db:(?:generate|migrate|seed|setup)\b/.test(command)) return;

  const hasDdl = DDL_PATTERN.test(command);
  if (/\bpsql\b/i.test(command) && hasDdl) {
    deny({
      permission: "deny",
      user_message:
        "Blocked: shell DDL (psql). Use packages/db/src/schema → pnpm db:generate → pnpm db:migrate.",
      agent_message:
        "Do not apply schema DDL via psql. Edit Drizzle schema and use pnpm db:generate / pnpm db:migrate unless the user explicitly requested this DDL.",
    });
  }
}

/**
 * @param {Record<string, unknown>} input
 */
function handleMcp(input) {
  if (hasExplicitOverride(input)) return;

  const toolName =
    typeof input.tool_name === "string" ? input.tool_name : "";
  if (!/run_sql/i.test(toolName)) {
    const mcpTool =
      input.tool_input && typeof input.tool_input === "object"
        ? /** @type {Record<string, unknown>} */ (input.tool_input).toolName
        : "";
    if (typeof mcpTool !== "string" || !/run_sql/i.test(mcpTool)) return;
  }

  const args =
    input.tool_input && typeof input.tool_input === "object"
      ? /** @type {Record<string, unknown>} */ (input.tool_input)
      : {};

  const argumentsPayload =
    args.arguments && typeof args.arguments === "object"
      ? /** @type {Record<string, unknown>} */ (args.arguments)
      : args;

  const statements = [];
  if (typeof argumentsPayload.sql === "string") {
    statements.push(argumentsPayload.sql);
  }
  if (Array.isArray(argumentsPayload.sqlStatements)) {
    for (const s of argumentsPayload.sqlStatements) {
      if (typeof s === "string") statements.push(s);
    }
  }

  const sqlBlob = statements.join("\n");
  if (!sqlBlob || !DDL_PATTERN.test(sqlBlob)) return;

  ask({
    permission: "ask",
    user_message:
      "Neon MCP DDL detected. Prefer pnpm db:migrate for schema changes unless you explicitly asked for live SQL.",
    agent_message:
      "Neon run_sql/run_sql_transaction contains DDL. Use packages/db/src/schema → pnpm db:generate → pnpm db:migrate. Override only when the user explicitly required hand-written SQL or a documented reset (e.g. DROP SCHEMA public CASCADE).",
  });
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

  if (typeof record.command === "string") {
    handleShell(record);
  } else if (
    typeof record.tool_name === "string" &&
    /run_sql/i.test(record.tool_name)
  ) {
    handleMcp(record);
  } else if (
    record.tool_input &&
    typeof record.tool_input === "object" &&
    typeof /** @type {Record<string, unknown>} */ (record.tool_input).toolName ===
      "string" &&
    /run_sql/i.test(
      /** @type {Record<string, unknown>} */ (record.tool_input).toolName,
    )
  ) {
    handleMcp(record);
  } else if (
    typeof record.tool_name === "string" &&
    WRITE_TOOLS.has(record.tool_name)
  ) {
    handlePreToolUse(record);
  }

  process.stdout.write('{"permission":"allow"}');
}

main();
