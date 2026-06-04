import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const RELATIVE_FILES = [
  "src/index.ts",
  "src/client.ts",
  "src/server.ts",
  "src/contracts/runtime.contract.ts",
  "src/contracts/component.contract.ts",
  "src/contracts/section.contract.ts",
  "src/contracts/action.contract.ts",
  "src/contracts/permission.contract.ts",
  "src/contracts/presentation.contract.ts",
  "src/schemas/list.schema.ts",
  "src/schemas/stat.schema.ts",
  "src/schemas/chart.schema.ts",
  "src/schemas/action-bar.schema.ts",
  "src/schemas/form.schema.ts",
  "src/schemas/kanban.schema.ts",
  "src/schemas/audit-panel.schema.ts",
  "src/schemas/detail-tabs.schema.ts",
  "src/schemas/page-header.schema.ts",
  "src/schemas/empty-state.schema.ts",
  "src/schemas/surface-chrome.schema.ts",
  "src/registry/component-registry.shared.ts",
  "src/registry/component-registry.server.ts",
  "src/registry/component-registry.client.ts",
  "src/registry/renderer-registry.server.ts",
  "src/registry/renderer-registry.client.ts",
  "src/runtime/resolve-runtime.shared.ts",
  "src/runtime/assert-runtime-boundary.shared.ts",
  "src/runtime/runtime-error.shared.ts",
  "src/runtime/runtime-diagnostics.shared.ts",
  "src/identity/identity.shared.ts",
  "src/identity/diagnostics.shared.ts",
  "src/identity/test-id.shared.ts",
  "src/identity/dom-attributes.shared.ts",
  "src/security/permission-gate.server.tsx",
  "src/security/permission-resolver.server.ts",
  "src/security/route-policy.shared.ts",
  "src/server-actions/action-fields.shared.ts",
  "src/server-actions/action-registry.server.ts",
  "src/server-actions/action-policy.server.ts",
  "src/server-actions/action-submit.action.ts",
  "src/shell/section-shell.server.tsx",
  "src/shell/section-card.server.tsx",
  "src/shell/section-body-resolver.server.ts",
  "src/shell/heading.server.tsx",
  "src/shell/empty-state.server.tsx",
  "src/sections/list/list-section.server.tsx",
  "src/sections/list/list-renderer.server.tsx",
  "src/sections/list/list-table.server.tsx",
  "src/sections/list/list-table.client.tsx",
  "src/sections/list/list-cell.client.tsx",
  "src/sections/list/list-toolbar.client.tsx",
  "src/sections/list/list-trailing-cell.client.tsx",
  "src/sections/list/list-trailing-action.server.tsx",
  "src/sections/list/list.builder.ts",
  "src/sections/list/list-table-props.shared.ts",
  "src/sections/list/list-identity.shared.ts",
  "src/sections/list/list-toolbar-url.shared.ts",
  "src/sections/stat/stat-section.server.tsx",
  "src/sections/stat/stat-renderer.server.tsx",
  "src/sections/stat/stat-card.client.tsx",
  "src/sections/stat/stat.builder.ts",
  "src/sections/stat/stat-layout.shared.ts",
  "src/sections/chart/chart-section.server.tsx",
  "src/sections/chart/chart-renderer.server.tsx",
  "src/sections/chart/chart-body.client.tsx",
  "src/sections/chart/chart-heatmap.client.tsx",
  "src/sections/chart/chart.builder.ts",
  "src/sections/action-bar/action-bar-section.server.tsx",
  "src/sections/action-bar/action-bar-renderer.server.tsx",
  "src/sections/action-bar/action-button.client.tsx",
  "src/sections/action-bar/action-bar.builder.ts",
  "src/sections/form/form-section.server.tsx",
  "src/sections/form/form-renderer.server.tsx",
  "src/sections/form/form.client.tsx",
  "src/sections/form/form-rules.shared.ts",
  "src/sections/form/form.builder.ts",
  "src/sections/kanban/kanban-section.server.tsx",
  "src/sections/kanban/kanban-renderer.server.tsx",
  "src/sections/kanban/kanban-board.server.tsx",
  "src/sections/kanban/kanban-drag-board.client.tsx",
  "src/sections/kanban/kanban-readonly-board.client.tsx",
  "src/sections/kanban/kanban-transition-hint.client.tsx",
  "src/sections/kanban/kanban-workflow.shared.ts",
  "src/sections/kanban/kanban.builder.ts",
  "src/sections/kanban/kanban-card-drop.shared.ts",
  "src/sections/kanban/kanban-card-transition.shared.ts",
  "src/sections/audit-panel/audit-panel-section.server.tsx",
  "src/sections/audit-panel/audit-panel-renderer.server.tsx",
  "src/sections/audit-panel/audit-panel.builder.ts",
  "src/sections/detail-tabs/detail-tabs-section.server.tsx",
  "src/sections/detail-tabs/detail-tabs-renderer.server.tsx",
  "src/sections/detail-tabs/detail-tabs.builder.ts",
  "src/sections/page-header/page-header.server.tsx",
  "src/sections/page-header/page-header.builder.ts",
  "src/renderers/render-component.server.tsx",
  "src/renderers/render-section.server.tsx",
  "src/renderers/render-stack.server.tsx",
  "src/renderers/render-child-tree.server.tsx",
  "src/presentation/presentation-profiles.shared.ts",
  "src/presentation/resolve-presentation.shared.ts",
  "src/logging/render-log.server.ts",
  "src/logging/list-render-log.server.ts",
  "src/tests/metadata-ui-test-ids.shared.ts",
  "src/tests/fixture-builders.shared.ts",
] as const;

function placeholderBody(relativePath: string): string {
  const base = path.basename(relativePath);
  const isClient =
    base.endsWith(".client.tsx") || base.endsWith(".client.ts");
  const isAction = base.endsWith(".action.ts") || base.endsWith(".action.tsx");
  const isServerOnly =
    relativePath === "src/server.ts" ||
    base.endsWith(".server.tsx") ||
    base.endsWith(".server.ts") ||
    relativePath.startsWith("src/renderers/") ||
    relativePath.startsWith("src/shell/") ||
    relativePath.startsWith("src/logging/") ||
    (relativePath.startsWith("src/sections/") &&
      (base.includes("-section.") ||
        base.includes("-renderer.") ||
        base.includes("-board.server.") ||
        base.includes("-trailing-action.")));

  const lines: string[] = [];
  if (isClient) {
    lines.push('"use client";', "");
  } else if (isAction) {
    lines.push('"use server";', "");
  } else if (isServerOnly) {
    lines.push('import "server-only";', "");
  }

  lines.push(
    "/**",
    ` * @afenda/metadata-ui ${relativePath.replace(/^src\//, "")}`,
    " * Scaffold placeholder — metadata-ui package skeleton (git-only).",
    " */",
    "export {};",
    "",
  );

  return lines.join("\n");
}

function doorBody(kind: "index" | "client" | "server"): string {
  if (kind === "server") {
    return [
      'import "server-only";',
      "",
      "/**",
      " * @afenda/metadata-ui/server",
      " * Server door — registries, renderers, sections, security, shell.",
      " * Scaffold placeholder — metadata-ui package skeleton (git-only).",
      " */",
      "export {};",
      "",
    ].join("\n");
  }
  if (kind === "client") {
    return [
      "/**",
      " * @afenda/metadata-ui/client",
      " * Client door — interactive section primitives and registries.",
      " * Scaffold placeholder — metadata-ui package skeleton (git-only).",
      " */",
      "export {};",
      "",
    ].join("\n");
  }
  return [
    "/**",
    " * @afenda/metadata-ui",
    " * Metadata-driven UI runtime — shared contracts, schemas, identity.",
    " * Scaffold placeholder — metadata-ui package skeleton (git-only).",
    " */",
    "export {};",
    "",
  ].join("\n");
}

function writeAlways(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

for (const relative of RELATIVE_FILES) {
  if (relative === "src/index.ts") {
    writeAlways(path.join(packageRoot, relative), doorBody("index"));
    continue;
  }
  if (relative === "src/client.ts") {
    writeAlways(path.join(packageRoot, relative), doorBody("client"));
    continue;
  }
  if (relative === "src/server.ts") {
    writeAlways(path.join(packageRoot, relative), doorBody("server"));
    continue;
  }
  writeAlways(path.join(packageRoot, relative), placeholderBody(relative));
}

console.log(`[metadata-ui] Wrote ${RELATIVE_FILES.length} placeholder modules.`);
