/**
 * Rewrite governed-surface ./schemas/* imports to flat gov-* modules (GUARD 5).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  path.join(root, "packages/governed-surface/src"),
  path.join(root, "packages/governed-surface/tests"),
];

const REPLACEMENTS: Record<string, string> = {
  "./schemas/schema-version.shared": "./gov-schema-version-shared",
  "../schemas/schema-version.shared": "./gov-schema-version-shared",
  "./schemas/erp-permission.shared": "./gov-erp-permission-shared",
  "../schemas/erp-permission.shared": "./gov-erp-permission-shared",
  "./schemas/erp-permission-requirement.schema": "./gov-erp-permission-requirement-schema",
  "../schemas/erp-permission-requirement.schema": "./gov-erp-permission-requirement-schema",
  "./schemas/server-actions.shared": "./gov-server-actions-shared",
  "../schemas/server-actions.shared": "./gov-server-actions-shared",
  "./schemas/action-bar.schema": "./gov-action-bar-schema",
  "../schemas/action-bar.schema": "./gov-action-bar-schema",
  "./schemas/action-result.shared": "./gov-action-result-shared",
  "../schemas/action-result.shared": "./gov-action-result-shared",
  "./schemas/list-surface.schema": "./gov-list-surface-schema",
  "../schemas/list-surface.schema": "./gov-list-surface-schema",
  "./schemas/list-surface-renderer.schema": "./gov-list-surface-renderer-schema",
  "../schemas/list-surface-renderer.schema": "./gov-list-surface-renderer-schema",
  "./schemas/list-surface-toolbar.schema": "./gov-list-surface-toolbar-schema",
  "../schemas/list-surface-toolbar.schema": "./gov-list-surface-toolbar-schema",
  "./schemas/list-surface-row-trailing-action.schema":
    "./gov-list-surface-row-trailing-action-schema",
  "../schemas/list-surface-row-trailing-action.schema":
    "./gov-list-surface-row-trailing-action-schema",
  "./schemas/list-trailing-cell-context.schema": "./gov-list-trailing-cell-context-schema",
  "../schemas/list-trailing-cell-context.schema": "./gov-list-trailing-cell-context-schema",
  "./schemas/stat-card.schema": "./gov-stat-card-schema",
  "../schemas/stat-card.schema": "./gov-stat-card-schema",
  "./schemas/presentation-profile.schema": "./gov-presentation-profile-schema",
  "../schemas/presentation-profile.schema": "./gov-presentation-profile-schema",
  "./schemas/approval-timeline.schema": "./gov-approval-timeline-schema",
  "../schemas/approval-timeline.schema": "./gov-approval-timeline-schema",
  "./schemas/multi-step-form.schema": "./gov-multi-step-form-schema",
  "../schemas/multi-step-form.schema": "./gov-multi-step-form-schema",
  "./schemas/scorecard-form.schema": "./gov-scorecard-form-schema",
  "../schemas/scorecard-form.schema": "./gov-scorecard-form-schema",
  "./schemas/surface-chrome.schema": "./gov-surface-chrome-schema",
  "../schemas/surface-chrome.schema": "./gov-surface-chrome-schema",
  "./schemas/surface-chrome.classes": "./gov-surface-chrome-classes",
  "../schemas/surface-chrome.classes": "./gov-surface-chrome-classes",
  "./schemas/detail-tabs.schema": "./gov-detail-tabs-schema",
  "../schemas/detail-tabs.schema": "./gov-detail-tabs-schema",
  "./schemas/audit-panel.schema": "./gov-audit-panel-schema",
  "../schemas/audit-panel.schema": "./gov-audit-panel-schema",
  "./schemas/kanban-board.schema": "./gov-kanban-board-schema",
  "../schemas/kanban-board.schema": "./gov-kanban-board-schema",
  "./schemas/governed-component-state.schema": "./gov-governed-component-state-schema",
  "../schemas/governed-component-state.schema": "./gov-governed-component-state-schema",
  "./schemas/page-header.schema": "./gov-page-header-schema",
  "../schemas/page-header.schema": "./gov-page-header-schema",
  "./schemas/component-registry.schema": "./gov-component-registry-schema",
  "../schemas/component-registry.schema": "./gov-component-registry-schema",
  "./schemas/workbench-search-params.shared": "./gov-workbench-search-params-shared",
  "../schemas/workbench-search-params.shared": "./gov-workbench-search-params-shared",
  "../../src/schemas/schema-version.shared": "../../src/gov-schema-version-shared",
  "../../src/schemas/list-surface-renderer.schema":
    "../../src/gov-list-surface-renderer-schema",
  "../../src/schemas/list-trailing-cell-context.schema":
    "../../src/gov-list-trailing-cell-context-schema",
  "../../src/schemas/index": "../../src/gov-schemas-barrel",
  "../../src/metadata/renderers/stat-card.renderer": "../../src/gov-stat-card-renderer",
  "../../src/metadata/renderers/approval-timeline.renderer":
    "../../src/gov-approval-timeline-renderer",
  "../../src/metadata/renderers/action-bar.renderer": "../../src/gov-action-bar-renderer",
  "../../src/metadata/renderers/chart.renderer": "../../src/gov-chart-renderer",
  "../../src/metadata/renderers/empty.renderer": "../../src/gov-empty-renderer",
  "../../src/metadata/renderers/list-surface.renderer": "../../src/gov-list-surface-renderer",
  "../../src/metadata/renderers/multi-step-form.renderer":
    "../../src/gov-multi-step-form-renderer",
  "../../src/metadata/renderers/scorecard-form.renderer":
    "../../src/gov-scorecard-form-renderer",
  "../../src/metadata/renderers/list-surface-chrome.shared":
    "../../src/gov-list-surface-chrome-shared",
  "../../src/metadata/renderers/list-surface-table-layout.shared":
    "../../src/gov-list-surface-table-layout-shared",
};

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|mts)$/.test(entry.name)) continue;
    let content = fs.readFileSync(full, "utf8");
    let changed = false;
    for (const [from, to] of Object.entries(REPLACEMENTS)) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(full, content);
      console.log(`[gov-imports] ${path.relative(root, full)}`);
    }
  }
}

for (const dir of targets) walk(dir);
console.log("[gov-imports] complete");
