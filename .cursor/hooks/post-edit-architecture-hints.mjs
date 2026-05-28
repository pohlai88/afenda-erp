#!/usr/bin/env node
/**
 * postToolUse (Write | StrReplace): inject targeted ARCH / verify hints for edited paths.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

/** @type {Array<{ test: (p: string) => boolean; hint: string }>} */
const ROUTES = [
  {
    test: (p) => p.startsWith("apps/erp/"),
    hint: [
      "**apps/erp** — rule `@afenda-erp-app` / `afenda-erp-app`.",
      "Doctrine: **ARCH-001** + `AGENTS.md`; feature deps via public doors + `afendaTranspilePackages` (**ARCH-008**).",
      "Before done: `pnpm typecheck`; dep/export changes → `pnpm architecture:check`; routes/flows → `pnpm test` / `pnpm test:e2e`.",
    ].join(" "),
  },
  {
    test: (p) => /^packages\/db\/src\/schema\/.+\.ts$/.test(p),
    hint: [
      "**schema edit** — rules `afenda-database`, `afenda-database-migrations`.",
      "Do not hand-write `drizzle/*.sql` or raw DDL.",
      "Before done: `pnpm db:generate` → review SQL → `pnpm db:migrate`.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/db/"),
    hint: [
      "**packages/db** — rule `afenda-database`.",
      "Doctrine: **ARCH-005** (schema/promotion), **ARCH-002** (ownership).",
      "Schema: edit `src/schema` only; `pnpm db:generate` + `pnpm db:migrate`.",
    ].join(" "),
  },
  {
    test: (p) =>
      p.startsWith("packages/governed-surface/") ||
      (p.startsWith("packages/domain/") &&
        (p.includes("surface") || p.includes("metadata"))),
    hint: [
      "**governed UI** — rule `afenda-governed-ui`.",
      "Doctrine: **ARCH-006** (runtime authority), **ARCH-007** (kernel).",
      "Before done: `pnpm lint:governed-renderers`.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/features/"),
    hint: [
      "**feature package** — rule `afenda-feature-packages`.",
      "Doctrine: **ARCH-008** (export doors, flat workspace), **ARCH-002**, **ARCH-004**.",
      "Doors: `.`, `./client`, `./server`, `./metadata` — no `/src`, `/dist`, `/internal`; `./client` must not pull db/ai/workflows/auth/server.",
      "Before done: `pnpm architecture:check`.",
    ].join(" "),
  },
  {
    test: (p) => p === "packages/config/src/next.ts",
    hint: [
      "**afendaTranspilePackages** — keep in sync with `apps/erp` workspace deps.",
      "Doctrine: **ARCH-008**. Before done: `pnpm architecture:check`.",
    ].join(" "),
  },
  {
    test: (p) => p === "scripts/check-directory-architecture.mts",
    hint: [
      "**architecture guard** — update **ARCH-008** / **ARCH-003** in the same PR when changing enforcement.",
      "Before done: `pnpm architecture:check`.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/"),
    hint: [
      "**workspace package** — rule `afenda-core` (+ package-specific rules).",
      "Boundaries: **ARCH-008**, **ARCH-002**, **ARCH-003**.",
      "Before done: `pnpm architecture:check` if layout/exports/imports changed.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("docs/architecture/"),
    hint: [
      "**architecture doc** — keep `ARCH-###` IDs aligned with filenames.",
      "Conflict order: ARCH-002 → ARCH-001; update conflicting docs in the same PR.",
    ].join(" "),
  },
  {
    test: (p) =>
      p.startsWith(".cursor/rules/") ||
      p.startsWith(".vscode/") ||
      p === ".editorconfig",
    hint: "Editor/rules change — ensure team docs still match (see `docs/architecture/README.md`).",
  },
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
 * @returns {string}
 */
function normalizePath(raw) {
  return raw.replace(/\\/g, "/").replace(/^\.\//, "");
}

function main() {
  let input = {};
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    process.stdout.write("{}");
    return;
  }

  const toolName = typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write("{}");
    return;
  }

  const rel = normalizePath(extractEditedPath(input));
  if (!rel) {
    process.stdout.write("{}");
    return;
  }

  const route = ROUTES.find((r) => r.test(rel));
  if (!route) {
    process.stdout.write("{}");
    return;
  }

  const additional_context = [
    "<!-- afenda-architecture-hook: post-edit -->",
    `Edited \`${rel}\`. ${route.hint}`,
  ].join("\n");

  process.stdout.write(JSON.stringify({ additional_context }));
}

main();
