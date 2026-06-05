import fs from "node:fs";
import path from "node:path";

import { scanMetadataUiEnforcement } from "./metadata-ui-guard.mts";

export const METADATA_UI_PACKAGE_DIR = "metadata-ui";

/** Declared in package.json: `"afenda": { "layout": "metadata-ui-runtime" }` */
export const METADATA_UI_LAYOUT = "metadata-ui-runtime";

export const METADATA_UI_SRC_ROOT_DIRS = new Set([
  "contracts",
  "schemas",
  "builders",
  "registry",
  "runtime",
  "identity",
  "security",
  "server-actions",
  "primitives",
  "shell",
  "sections",
  "renderers",
  "presentation",
  "logging",
  "migration",
  "tests",
]);

export const METADATA_UI_SECTION_KINDS = new Set([
  "list",
  "stat",
  "chart",
  "action-bar",
  "form",
  "multi-step-form",
  "scorecard-form",
  "kanban",
  "audit-panel",
  "approval-timeline",
  "detail-tabs",
  "page-header",
]);

const PUBLIC_DOOR_FILES = new Set(["index.ts", "client.ts", "server.ts"]);
const SECTION_COMPOSITION_FILES = new Set([
  "render-child-tree.server.tsx",
  "render-component.server.tsx",
  "render-registered-section.server.tsx",
  "render-section.server.tsx",
  "render-stack.server.tsx",
]);

/** purpose + runtime — e.g. list-section.server.tsx, list.schema.ts */
export const METADATA_UI_FILE_NAME =
  /^[a-z0-9][a-z0-9-]*\.(?:server|client|shared|schema|builder|contract|action|registry)\.(?:ts|tsx)$/;

const BANNED_PREFIX = /^gov-/;
const BANNED_SUBSTRINGS = [
  "gov-governed",
  "governed-pattern",
  "list-surface",
  "stat-card-renderer",
  "-surface-table",
  "-surface-chrome",
  "-helper-",
  "-utils-",
] as const;

export function isMetadataUiRuntimePackage(packageDirName: string) {
  return packageDirName === METADATA_UI_PACKAGE_DIR;
}

export function readMetadataUiDeclaredLayout(packageDir: string): string | null {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    afenda?: { layout?: string };
  };
  return pkg.afenda?.layout ?? null;
}

export function metadataUiFileNameViolation(fileName: string): string | null {
  if (fileName.endsWith(".md") || fileName === ".gitkeep") return null;

  if (BANNED_PREFIX.test(fileName)) {
    return `ban gov- prefix noise — use purpose.runtime (e.g. list-section.server.tsx), not "${fileName}"`;
  }

  for (const banned of BANNED_SUBSTRINGS) {
    if (fileName.includes(banned)) {
      return `ban legacy governed-surface naming fragment "${banned}" in "${fileName}"`;
    }
  }

  if (/^governed-/i.test(fileName)) {
    return `ban governed- prefix — use purpose + runtime only: "${fileName}"`;
  }

  if (!METADATA_UI_FILE_NAME.test(fileName)) {
    return `use purpose.runtime.ts(x) (e.g. list-table.client.tsx, permission-gate.server.tsx, list.builder.ts), not "${fileName}"`;
  }

  const runtime = fileName.match(
    /\.(server|client|shared|schema|builder|contract|action|registry)\.(?:ts|tsx)$/,
  )?.[1];

  if (
    runtime === "client" &&
    !fileName.endsWith(".client.tsx") &&
    !fileName.endsWith(".client.ts")
  ) {
    return `client runtime must use .client.ts(x): "${fileName}"`;
  }

  if (
    runtime === "action" &&
    !fileName.endsWith(".action.ts") &&
    !fileName.endsWith(".action.tsx")
  ) {
    return `action runtime must use .action.ts(x): "${fileName}"`;
  }

  return null;
}

export function scanMetadataUiPackage(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;
  const srcRel = `${packageRel}/src`;

  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    const rel = `${srcRel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (!METADATA_UI_SRC_ROOT_DIRS.has(entry.name)) {
        problems.push(
          `metadata-ui: ${rel}/ — unknown root folder; allowed: ${[...METADATA_UI_SRC_ROOT_DIRS].join(", ")}`,
        );
      } else if (entry.name === "sections") {
        scanMetadataUiSections(path.join(srcRoot, entry.name), rel, problems);
      } else {
        scanMetadataUiFlatFolder(path.join(srcRoot, entry.name), rel, problems);
      }
      continue;
    }

    if (!entry.isFile()) continue;

    if (PUBLIC_DOOR_FILES.has(entry.name)) continue;

    problems.push(
      `metadata-ui: ${rel} — src/ root allows only index.ts, client.ts, server.ts plus layer folders`,
    );
  }
}

function scanMetadataUiSections(
  sectionsRoot: string,
  sectionsRel: string,
  problems: string[],
) {
  for (const entry of fs.readdirSync(sectionsRoot, { withFileTypes: true })) {
    const rel = `${sectionsRel}/${entry.name}`;

    if (entry.isFile()) {
      if (!SECTION_COMPOSITION_FILES.has(entry.name)) {
        problems.push(`metadata-ui: ${rel} — section files belong in sections/<kind>/`);
        continue;
      }

      const violation = metadataUiFileNameViolation(entry.name);
      if (violation) {
        problems.push(`metadata-ui: ${rel}: ${violation}`);
      }
      continue;
    }

    if (!entry.isDirectory()) continue;

    if (!METADATA_UI_SECTION_KINDS.has(entry.name)) {
      problems.push(
        `metadata-ui: ${rel}/ — unknown section kind; allowed: ${[...METADATA_UI_SECTION_KINDS].join(", ")}`,
      );
    }

    scanMetadataUiFlatFolder(path.join(sectionsRoot, entry.name), rel, problems);
  }
}

function scanMetadataUiFlatFolder(
  dir: string,
  rel: string,
  problems: string[],
) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const childRel = `${rel}/${entry.name}`;

    if (entry.isDirectory()) {
      problems.push(`metadata-ui: ${childRel}/ — folders must not nest below this layer`);
      continue;
    }

    if (!entry.isFile()) continue;
    const violation = metadataUiFileNameViolation(entry.name);
    if (violation) {
      problems.push(`metadata-ui: ${childRel}: ${violation}`);
    }
  }
}

export function scanMetadataUiFromRoot(
  packageRoot: string,
  packageRel = `packages/${METADATA_UI_PACKAGE_DIR}`,
): string[] {
  const problems: string[] = [];
  const srcRoot = path.join(packageRoot, "src");

  if (!fs.existsSync(srcRoot)) {
    problems.push(`metadata-ui: missing ${packageRel}/src`);
    return problems;
  }

  const declared = readMetadataUiDeclaredLayout(packageRoot);
  if (declared !== METADATA_UI_LAYOUT) {
    problems.push(
      `metadata-ui: package.json must declare "afenda": { "layout": "${METADATA_UI_LAYOUT}" }`,
    );
  }

  scanMetadataUiPackage({ srcRoot, packageRel, problems });
  scanMetadataUiEnforcement({ srcRoot, packageRel, problems });
  return problems;
}

/** @deprecated Use scanMetadataUiFromRoot */
export function scanMetadataUiNamingFromRoot(
  packageRoot: string,
  packageRel?: string,
): string[] {
  return scanMetadataUiFromRoot(packageRoot, packageRel);
}
