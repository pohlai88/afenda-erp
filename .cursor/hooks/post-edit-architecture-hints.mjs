#!/usr/bin/env node
/**
 * postToolUse (Write | StrReplace): inject targeted ARCH / verify hints for edited paths.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

/** @type {Array<{ test: (p: string) => boolean; hint: string }>} */
const ROUTES = [
  {
    test: (p) => p.startsWith("apps/erp/src/workspace-routes/"),
    hint: [
      "**workspace-routes** — rule `afenda-erp-app`.",
      "Route composition outside `src/app/`; keep App Router pages thin.",
      "Doctrine: **ARCH-001** §shell/streaming. Before done: `pnpm typecheck`; route changes → `pnpm test:e2e`.",
    ].join(" "),
  },
  {
    test: (p) =>
      p.startsWith("apps/erp/src/lib/system-admin-sections/") ||
      p === "apps/erp/src/lib/system-admin-route.shared.ts",
    hint: [
      "**system-admin adapter** — rule `afenda-system-admin`.",
      "Thin slug adapters only; behavior in `@afenda/feature-system-admin`.",
      "Doctrine: **ARCH-011**, **ARCH-002** §§4–5. Drift checks run automatically (enforce-architecture-drift hook).",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/features/system-admin/"),
    hint: [
      "**@afenda/feature-system-admin** — rule `afenda-system-admin`.",
      "Doctrine: **ARCH-011** (+ vertical `*-architecture.md` supplement).",
      "Do not delete `*architecture*` docs — update in place.",
      "Before done: `pnpm architecture:check`; surfaces → `pnpm lint:governed-renderers`.",
    ].join(" "),
  },
  {
    test: (p) =>
      p.startsWith("packages/features/hr-suite/") &&
      p.includes("compliance-regulatory-tracking/"),
    hint: [
      "**HR compliance vertical** — rule `afenda-hr-feature-vertical` (mirrors system-admin).",
      "Prefix files `hr.workforce.compliance.*`; list surfaces in `surface/`; audit in `events/`.",
      "Doors: server (I/O), client (components), metadata (surfaces/copy only).",
      "Before done: `pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts`.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/features/hr-suite/"),
    hint: [
      "**@afenda/feature-hr-suite** — rule `afenda-hr-feature-vertical` + `afenda-feature-packages`.",
      "Doctrine: **ARCH-010**, **ARCH-008**. Shipped slices use `hr.<domain>.*` file naming like system-admin.",
      "Before done: `pnpm architecture:check`; `pnpm --filter @afenda/feature-hr-suite test`.",
    ].join(" "),
  },
  {
    test: (p) =>
      p.startsWith("packages/features/knowledge/") ||
      p.startsWith("packages/features/lynx/") ||
      p.startsWith("apps/erp/src/app/api/internal/v1/lynx/"),
    hint: [
      "**Lynx / Knowledge** — rule `afenda-lynx-knowledge`.",
      "Doctrine: **ARCH-009**. Substrate vs product split; banned AI-assistant vocabulary.",
    ].join(" "),
  },
  {
    test: (p) => p.startsWith("packages/kernel/src/execution-kernel/"),
    hint: [
      "**Execution Kernel** — rule `afenda-core`.",
      "Doctrine: **ARCH-002** §5 (execution kernel only). Must not import `@afenda/feature-*`.",
      "preToolUse blocks bad imports; postToolUse runs kernel:check + kernel tests automatically.",
    ].join(" "),
  },
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
      (p.startsWith("packages/kernel/") &&
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
      "Drift: `architecture:check` runs automatically after edits (enforce-architecture-drift hook).",
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
      "**architecture doc** — rule `afenda-architecture-docs`.",
      "Keep `ARCH-###` IDs aligned with filenames; do not delete — edit and cross-link.",
      "Conflict order: ARCH-002 → ARCH-001; ARCH-011 ↔ ARCH-002 §§3–4 for admin vs execution.",
    ].join(" "),
  },
  {
    test: (p) => /architecture[^/]*\.md$/i.test(p),
    hint: [
      "**architecture supplement** — rule `afenda-architecture-docs`.",
      "Package vertical docs link to `docs/architecture/` — preserve file; document target compliance and §7-style gaps only (no 'as-built OK').",
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
