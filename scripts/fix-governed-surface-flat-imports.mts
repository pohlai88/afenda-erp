/**
 * Restore post-migration compatibility paths for governed-surface:
 * - src/schemas/* shims → flat gov-* modules
 * - src/metadata/renderers/* shims → flat gov-* renderer modules
 * - src/renderers/* shims for dispatch imports
 * - i18n/* and utils/* shims at package root
 * - Fix stale ../../ relative imports in flat src files
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgRoot = path.join(root, "packages/governed-surface");
const srcRoot = path.join(pkgRoot, "src");

const SCHEMA_SHIMS: Record<string, string> = {
  "schema-version.shared.ts": "../gov-schema-version-shared",
  "erp-permission.shared.ts": "../gov-erp-permission-shared",
  "erp-permission-requirement.schema.ts": "../gov-erp-permission-requirement-schema",
  "server-actions.shared.ts": "../gov-server-actions-shared",
  "action-bar.schema.ts": "../gov-action-bar-schema",
  "action-result.shared.ts": "../gov-action-result-shared",
  "list-surface.schema.ts": "../gov-list-surface-schema",
  "list-surface-renderer.schema.ts": "../gov-list-surface-renderer-schema",
  "list-surface-toolbar.schema.ts": "../gov-list-surface-toolbar-schema",
  "list-surface-row-trailing-action.schema.ts":
    "../gov-list-surface-row-trailing-action-schema",
  "list-trailing-cell-context.schema.ts":
    "../gov-list-trailing-cell-context-schema",
  "stat-card.schema.ts": "../gov-stat-card-schema",
  "presentation-profile.schema.ts": "../gov-presentation-profile-schema",
  "approval-timeline.schema.ts": "../gov-approval-timeline-schema",
  "multi-step-form.schema.ts": "../gov-multi-step-form-schema",
  "scorecard-form.schema.ts": "../gov-scorecard-form-schema",
  "surface-chrome.schema.ts": "../gov-surface-chrome-schema",
  "surface-chrome.classes.ts": "../gov-surface-chrome-classes",
  "detail-tabs.schema.ts": "../gov-detail-tabs-schema",
  "audit-panel.schema.ts": "../gov-audit-panel-schema",
  "kanban-board.schema.ts": "../gov-kanban-board-schema",
  "governed-component-state.schema.ts": "../gov-governed-component-state-schema",
  "page-header.schema.ts": "../gov-page-header-schema",
  "component-registry.schema.ts": "../gov-component-registry-schema",
  "workbench-search-params.shared.ts": "../gov-workbench-search-params-shared",
  "chart.schema.ts": "../gov-chart-schema",
  "section.schema.ts": "../gov-section-schema",
  "stack.schema.ts": "../gov-stack-schema",
  "empty.schema.ts": "../gov-list-surface-schema",
  "form-rules.schema.ts": "../gov-form-rules-schema",
};

const RENDERER_SHIMS: Record<string, { target: string; named?: string[] }> = {
  "stat-card.renderer.tsx": { target: "../../gov-stat-card-renderer", named: ["StatCardRenderer"] },
  "list-surface.renderer.tsx": { target: "../../gov-list-surface-renderer", named: ["ListSurfaceRenderer"] },
  "section.renderer.tsx": { target: "../../gov-section-renderer", named: ["SectionRenderer"] },
  "stack.renderer.tsx": { target: "../../gov-stack-renderer", named: ["StackRenderer"] },
  "empty.renderer.tsx": { target: "../../gov-empty-renderer", named: ["EmptyRenderer"] },
  "action-bar.renderer.tsx": { target: "../../gov-action-bar-renderer", named: ["ActionBarRenderer"] },
  "audit-panel.renderer.tsx": { target: "../../gov-audit-panel-renderer", named: ["AuditPanelRenderer"] },
  "detail-tabs.renderer.tsx": { target: "../../gov-detail-tabs-renderer", named: ["DetailTabsRenderer"] },
  "approval-timeline.renderer.tsx": { target: "../../gov-approval-timeline-renderer", named: ["ApprovalTimelineRenderer"] },
  "chart.renderer.tsx": { target: "../../gov-chart-renderer", named: ["ChartRenderer"] },
  "kanban-board.renderer.tsx": { target: "../../gov-kanban-board-renderer", named: ["KanbanBoardRenderer"] },
  "multi-step-form.renderer.tsx": { target: "../../gov-multi-step-form-renderer", named: ["MultiStepFormRenderer"] },
  "scorecard-form.renderer.tsx": { target: "../../gov-scorecard-form-renderer", named: ["ScorecardFormRenderer"] },
  "kanban-board-view.tsx": { target: "../../gov-kanban-board-view", named: ["KanbanBoardView"] },
  "kanban-board-drag-view.client.tsx": { target: "../../gov-kanban-board-drag-view-client", named: ["KanbanBoardDragView"] },
  "list-surface-chrome.shared.ts": { target: "../../gov-list-surface-chrome-shared" },
  "list-surface-table-layout.shared.ts": { target: "../../gov-list-surface-table-layout-shared" },
  "list-surface-table.client.tsx": { target: "../../gov-list-surface-table-client" },
  "list-surface-table.tsx": { target: "../gov-list-surface-table" },
};

function writeShim(dir: string, fileName: string, body: string) {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, body);
  console.log(`[gov-shims] ${path.relative(root, filePath)}`);
}

function shimExportAll(target: string) {
  return `export * from "${target}";\n`;
}

function shimNamedExport(target: string, names: string[]) {
  return `export { ${names.join(", ")} } from "${target}";\n`;
}

// schemas/
const schemasDir = path.join(srcRoot, "schemas");
for (const [fileName, target] of Object.entries(SCHEMA_SHIMS)) {
  writeShim(schemasDir, fileName, shimExportAll(target));
}
writeShim(
  schemasDir,
  "index.ts",
  Object.keys(SCHEMA_SHIMS)
    .map((f) => `export * from "./${f.replace(/\.tsx?$/, "")}";`)
    .join("\n") + "\n",
);

// metadata/renderers/
const renderersDir = path.join(srcRoot, "metadata/renderers");
for (const [fileName, spec] of Object.entries(RENDERER_SHIMS)) {
  const body = spec.named
    ? shimNamedExport(spec.target, spec.named)
    : shimExportAll(spec.target);
  writeShim(renderersDir, fileName, body);
}
writeShim(
  path.join(srcRoot, "metadata"),
  "index.ts",
  `export * from "../gov-registry";\nexport * from "./renderers/list-surface-chrome.shared";\n`,
);

// src/renderers/ (dispatch imports without .tsx extension)
const flatRenderersDir = path.join(srcRoot, "renderers");
for (const [fileName, spec] of Object.entries(RENDERER_SHIMS)) {
  if (!fileName.endsWith(".renderer.tsx") && fileName !== "list-surface-table.tsx") continue;
  const base = fileName.replace(/\.renderer\.tsx$/, ".renderer").replace(/\.tsx$/, "");
  const body = spec.named
    ? shimNamedExport(spec.target.replace("../../", "../"), spec.named)
    : shimExportAll(spec.target.replace("../../", "../"));
  writeShim(flatRenderersDir, `${base}.ts`, body.replace(".tsx", ""));
  if (fileName.endsWith(".renderer.tsx")) {
    writeShim(flatRenderersDir, base + ".tsx", body.replace("../", "./").replace("gov-", "gov-"));
  }
}

// Package-root i18n + utils shims
writeShim(
  path.join(pkgRoot, "i18n"),
  "governed-renderer-copy.shared.ts",
  shimExportAll("../src/gov-governed-renderer-copy-shared"),
);
writeShim(
  path.join(pkgRoot, "utils"),
  "governed-diagnostics.shared.ts",
  shimExportAll("../src/gov-governed-diagnostics-shared"),
);
writeShim(
  path.join(pkgRoot, "utils"),
  "governed-identity.shared.ts",
  shimExportAll("../src/gov-governed-identity-shared"),
);

// Fix stale deep relative imports in src/
const IMPORT_REPLACEMENTS: [RegExp, string][] = [
  [/from "\.\.\/\.\.\/schemas\//g, 'from "./schemas/'],
  [/from '\.\.\/\.\.\/schemas\//g, "from './schemas/"],
  [/from "\.\.\/\.\.\/i18n\//g, 'from "../i18n/'],
  [/from '\.\.\/\.\.\/i18n\//g, "from '../i18n/"],
  [/from "\.\.\/\.\.\/utils\//g, 'from "../utils/'],
  [/from '\.\.\/\.\.\/utils\//g, "from '../utils/"],
  [/from "\.\/stat-card-body\.client"/g, 'from "./gov-stat-card-body-client"'],
  [/from "\.\/renderers\//g, 'from "./renderers/'],
];

function walkFix(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "schemas" || entry.name === "metadata" || entry.name === "renderers") {
        continue;
      }
      walkFix(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    let content = fs.readFileSync(full, "utf8");
    let changed = false;
    for (const [pattern, replacement] of IMPORT_REPLACEMENTS) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(full, content);
      console.log(`[gov-shims] fixed imports in ${path.relative(root, full)}`);
    }
  }
}

walkFix(srcRoot);

// Remove migration collision duplicate from doors if present
for (const door of ["client.ts", "server.ts"] as const) {
  const doorPath = path.join(srcRoot, door);
  if (!fs.existsSync(doorPath)) continue;
  const content = fs.readFileSync(doorPath, "utf8");
  const filtered = content
    .split("\n")
    .filter((line) => !line.includes("gov-governed-component-state-schema.schemas"))
    .join("\n");
  if (filtered !== content) {
    fs.writeFileSync(doorPath, filtered);
    console.log(`[gov-shims] removed collision export from ${door}`);
  }
}

console.log("[gov-shims] complete");
