import fs from "node:fs";
import path from "node:path";

export type MetadataUiRuntime = "shared" | "server" | "client" | "action" | "unknown";

export type MetadataUiDoor = "index" | "client" | "server";

const DOOR_FILES: Record<MetadataUiDoor, string> = {
  index: "index.ts",
  client: "client.ts",
  server: "server.ts",
};

/** Downward dependency ranks — higher may import lower, never the reverse. */
export const METADATA_UI_LAYER_RANK: Record<string, number> = {
  contracts: 0,
  schemas: 1,
  builders: 1,
  identity: 1,
  migration: 1,
  presentation: 1,
  registry: 2,
  runtime: 3,
  renderers: 3,
  security: 3,
  "server-actions": 3,
  logging: 3,
  primitives: 3,
  shell: 5,
  sections: 6,
  tests: 99,
};

export const METADATA_UI_SECTION_CONTRACT = [
  {
    kind: "list",
    schema: "list.schema.ts",
    builder: "list.builder.ts",
    section: "list-section.server.tsx",
    renderer: "list-renderer.server.tsx",
  },
  {
    kind: "stat",
    schema: "stat.schema.ts",
    builder: "stat.builder.ts",
    section: "stat-section.server.tsx",
    renderer: "stat-renderer.server.tsx",
  },
  {
    kind: "chart",
    schema: "chart.schema.ts",
    builder: "chart.builder.ts",
    section: "chart-section.server.tsx",
    renderer: "chart-renderer.server.tsx",
  },
  {
    kind: "action-bar",
    schema: "action-bar.schema.ts",
    builder: "action-bar.builder.ts",
    section: "action-bar-section.server.tsx",
    renderer: "action-bar-renderer.server.tsx",
  },
  {
    kind: "form",
    schema: "form.schema.ts",
    builder: "form.builder.ts",
    section: "form-section.server.tsx",
    renderer: "form-renderer.server.tsx",
  },
  {
    kind: "multi-step-form",
    schema: "multi-step-form.schema.ts",
    builder: "multi-step-form.builder.ts",
    section: "multi-step-form-section.server.tsx",
    renderer: "multi-step-form-renderer.server.tsx",
  },
  {
    kind: "scorecard-form",
    schema: "scorecard-form.schema.ts",
    builder: "scorecard-form.builder.ts",
    section: "scorecard-form-section.server.tsx",
    renderer: "scorecard-form-renderer.server.tsx",
  },
  {
    kind: "kanban",
    schema: "kanban.schema.ts",
    builder: "kanban.builder.ts",
    section: "kanban-section.server.tsx",
    renderer: "kanban-renderer.server.tsx",
  },
  {
    kind: "audit-panel",
    schema: "audit-panel.schema.ts",
    builder: "audit-panel.builder.ts",
    section: "audit-panel-section.server.tsx",
    renderer: "audit-panel-renderer.server.tsx",
  },
  {
    kind: "approval-timeline",
    schema: "approval-timeline.schema.ts",
    builder: "approval-timeline.builder.ts",
    section: "approval-timeline-section.server.tsx",
    renderer: "approval-timeline-renderer.server.tsx",
  },
  {
    kind: "detail-tabs",
    schema: "detail-tabs.schema.ts",
    builder: "detail-tabs.builder.ts",
    section: "detail-tabs-section.server.tsx",
    renderer: "detail-tabs-renderer.server.tsx",
  },
  {
    kind: "page-header",
    schema: "page-header.schema.ts",
    builder: "page-header.builder.ts",
    section: "page-header.server.tsx",
    renderer: "page-header-renderer.server.tsx",
  },
] as const;

const EXPORT_FROM_RE =
  /export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+["'](\.[^"']+)["']/g;

const IMPORT_FROM_RE =
  /import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?["'](\.[^"']+)["']/g;

export function inferMetadataUiFileRuntime(relativePath: string): MetadataUiRuntime {
  const base = path.basename(relativePath).replace(/\\/g, "/");
  if (/\.client\.tsx?$/.test(base)) return "client";
  if (/\.server\.tsx?$/.test(base)) return "server";
  if (/\.action\.tsx?$/.test(base)) return "action";
  if (/\.(shared|schema|contract|builder|registry)\.ts$/.test(base)) {
    return "shared";
  }
  if (base === "index.ts" || base === "client.ts" || base === "server.ts") {
    return "unknown";
  }
  return "unknown";
}

function resolveRelativeImport(
  fromFile: string,
  specifier: string,
  srcRoot: string,
): string | null {
  const fromDir = path.dirname(fromFile);
  const raw = path.normalize(path.join(fromDir, specifier)).replace(/\\/g, "/");
  const candidates = [
    raw,
    `${raw}.ts`,
    `${raw}.tsx`,
    path.join(raw, "index.ts").replace(/\\/g, "/"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.relative(srcRoot, candidate).replace(/\\/g, "/");
    }
  }
  return null;
}

function layerForSrcRelative(relativePath: string): number | null {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("tests/")) return METADATA_UI_LAYER_RANK.tests ?? null;

  const [top] = normalized.split("/");
  if (!top) return null;
  if (top === "sections") return METADATA_UI_LAYER_RANK.sections ?? null;
  return METADATA_UI_LAYER_RANK[top] ?? null;
}

function hasUseClientDirective(source: string): boolean {
  return /^\s*["']use client["'];?\s*$/m.test(source);
}

function hasUseServerDirective(source: string): boolean {
  return /^\s*["']use server["'];?\s*$/m.test(source);
}

function isActionRegistrationModule(source: string, relativePath: string): boolean {
  return (
    relativePath.includes("action-registry") ||
    /registerAction|actionRegistry|ACTION_REGISTRY/.test(source)
  );
}

export function scanMetadataUiRuntimeMarkers(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;

  for (const filePath of walkSourceFiles(srcRoot)) {
    const relative = path.relative(srcRoot, filePath).replace(/\\/g, "/");
    if (relative.startsWith("tests/")) continue;

    const source = fs.readFileSync(filePath, "utf8");
    const rel = `${packageRel}/src/${relative}`;
    const base = path.basename(relative);

    if (/\.client\.tsx$/.test(base)) {
      if (!hasUseClientDirective(source)) {
        problems.push(
          `metadata-ui runtime: ${rel} must begin with "use client"`,
        );
      }
    }

    if (/\.server\.tsx?$/.test(base) && hasUseClientDirective(source)) {
      problems.push(`metadata-ui runtime: ${rel} must not contain "use client"`);
    }

    if (/\.action\.tsx?$/.test(base)) {
      const registered =
        hasUseServerDirective(source) || isActionRegistrationModule(source, relative);
      if (!registered) {
        problems.push(
          `metadata-ui runtime: ${rel} must contain "use server" or action registration`,
        );
      }
    }

    if (/\.(shared|schema|contract|builder|registry)\.ts$/.test(base)) {
      if (hasUseClientDirective(source)) {
        problems.push(
          `metadata-ui runtime: ${rel} is shared runtime and must not contain "use client"`,
        );
      }
      if (hasUseServerDirective(source)) {
        problems.push(
          `metadata-ui runtime: ${rel} is shared runtime and must not contain "use server"`,
        );
      }
    }
  }
}

const PROHIBITED_REGISTRY_DISCOVERY = [
  { pattern: /\breaddirSync\s*\(/, label: "filesystem scanning (readdirSync)" },
  { pattern: /\breaddir\s*\(/, label: "filesystem scanning (readdir)" },
  { pattern: /\bglob(?:Sync)?\s*\(/, label: "filesystem glob discovery" },
  { pattern: /import\s*\(\s*[`'"][^`'"]*sections/, label: "dynamic import section discovery" },
  { pattern: /import\.meta\.glob\s*\(/, label: "import.meta.glob discovery" },
] as const;

const REGISTRY_DISCOVERY_SCAN_DIRS = [
  "registry",
  "renderers",
  "runtime",
  "shell",
] as const;

function findSectionArtifact(
  srcRoot: string,
  kind: string,
  basename: string,
): string | null {
  const sectionKindRoot = path.join(srcRoot, "sections", kind);
  if (!fs.existsSync(sectionKindRoot)) return null;

  const artifactPath = path.join(sectionKindRoot, basename);
  return fs.existsSync(artifactPath) ? artifactPath : null;
}

export function scanMetadataUiProhibitedDiscovery(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;

  for (const dir of REGISTRY_DISCOVERY_SCAN_DIRS) {
    const scanRoot = path.join(srcRoot, dir);
    if (!fs.existsSync(scanRoot)) continue;

    for (const filePath of walkSourceFiles(scanRoot)) {
      const relative = path.relative(srcRoot, filePath).replace(/\\/g, "/");
      const source = fs.readFileSync(filePath, "utf8");

      for (const { pattern, label } of PROHIBITED_REGISTRY_DISCOVERY) {
        if (pattern.test(source)) {
          problems.push(
            `metadata-ui registry: ${packageRel}/src/${relative} prohibits ${label} — use registry modules only`,
          );
        }
      }
    }
  }
}

function collectExportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  let match: RegExpExecArray | null;
  EXPORT_FROM_RE.lastIndex = 0;
  while ((match = EXPORT_FROM_RE.exec(source)) !== null) {
    if (match[1]) specifiers.push(match[1]);
  }
  return specifiers;
}

function collectImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  let match: RegExpExecArray | null;
  IMPORT_FROM_RE.lastIndex = 0;
  while ((match = IMPORT_FROM_RE.exec(source)) !== null) {
    if (match[1]) specifiers.push(match[1]);
  }
  return specifiers;
}

function isPlaceholderModule(source: string): boolean {
  return (
    /export\s*\{\s*\}\s*;/.test(source) &&
    !/export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from/.test(source)
  );
}

export function scanMetadataUiDoors(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;

  for (const [door, fileName] of Object.entries(DOOR_FILES) as [
    MetadataUiDoor,
    string,
  ][]) {
    const doorPath = path.join(srcRoot, fileName);
    const doorRel = `${packageRel}/src/${fileName}`;
    if (!fs.existsSync(doorPath)) {
      problems.push(`metadata-ui doors: missing ${doorRel}`);
      continue;
    }

    const source = fs.readFileSync(doorPath, "utf8");
    const allowedExportRuntime: MetadataUiRuntime =
      door === "index" ? "shared" : door === "client" ? "client" : "server";

    if (door === "index") {
      if (/["']use client["']/.test(source)) {
        problems.push(`metadata-ui doors: ${doorRel} must not contain "use client"`);
      }
      if (/import\s+["']server-only["']/.test(source)) {
        problems.push(`metadata-ui doors: ${doorRel} must not import server-only`);
      }
    }

    if (door === "client" && /import\s+["']server-only["']/.test(source)) {
      problems.push(`metadata-ui doors: ${doorRel} must not import server-only`);
    }

    if (door === "server" && !/import\s+["']server-only["']/.test(source)) {
      problems.push(`metadata-ui doors: ${doorRel} must import "server-only"`);
    }

    for (const specifier of collectExportSpecifiers(source)) {
      const targetRel = resolveRelativeImport(doorPath, specifier, srcRoot);
      if (!targetRel) {
        problems.push(
          `metadata-ui doors: ${doorRel} exports unresolved path "${specifier}"`,
        );
        continue;
      }

      const targetRuntime = inferMetadataUiFileRuntime(targetRel);
      if (targetRuntime === "unknown") {
        problems.push(
          `metadata-ui doors: ${doorRel} exports "${targetRel}" with unknown runtime suffix`,
        );
        continue;
      }

      if (allowedExportRuntime === "shared" && targetRuntime !== "shared") {
        problems.push(
          `metadata-ui doors: ${doorRel} must remain runtime-neutral — cannot export ${targetRuntime} module "${targetRel}"`,
        );
      }

      if (allowedExportRuntime === "client" && targetRuntime !== "client") {
        problems.push(
          `metadata-ui doors: ${doorRel} must export client runtime only — "${targetRel}" is ${targetRuntime}`,
        );
      }

      if (
        allowedExportRuntime === "server" &&
        targetRuntime !== "server" &&
        targetRuntime !== "action"
      ) {
        problems.push(
          `metadata-ui doors: ${doorRel} must export server runtime only — "${targetRel}" is ${targetRuntime}`,
        );
      }
    }
  }
}

export function scanMetadataUiDependencies(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;

  for (const filePath of walkSourceFiles(srcRoot)) {
    const relative = path.relative(srcRoot, filePath).replace(/\\/g, "/");
    if (relative.startsWith("tests/")) continue;

    const importerLayer = layerForSrcRelative(relative);
    if (importerLayer == null) continue;

    const source = fs.readFileSync(filePath, "utf8");
    for (const specifier of collectImportSpecifiers(source)) {
      if (!specifier.startsWith(".")) continue;

      const targetRel = resolveRelativeImport(filePath, specifier, srcRoot);
      if (!targetRel) continue;

      const targetLayer = layerForSrcRelative(targetRel);
      if (targetLayer == null) continue;

      if (targetLayer > importerLayer) {
        problems.push(
          `metadata-ui dependencies: ${packageRel}/src/${relative} (layer ${importerLayer}) must not import upward ${targetRel} (layer ${targetLayer})`,
        );
      }
    }
  }
}

export function scanMetadataUiRegistry(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;

  const requiredRegistryFiles = [
    "registry/component-registry.shared.ts",
    "registry/component-registry.server.ts",
    "registry/renderer-registry.server.ts",
  ] as const;

  for (const rel of requiredRegistryFiles) {
    if (!fs.existsSync(path.join(srcRoot, rel))) {
      problems.push(`metadata-ui registry: missing required ${packageRel}/src/${rel}`);
    }
  }

  const rendererRegistryPath = path.join(
    srcRoot,
    "registry/renderer-registry.server.ts",
  );
  if (!fs.existsSync(rendererRegistryPath)) return;

  const registrySource = fs.readFileSync(rendererRegistryPath, "utf8");
  const registryIsPlaceholder = isPlaceholderModule(registrySource);

  for (const entry of METADATA_UI_SECTION_CONTRACT) {
    const rendererArtifact = entry.renderer;
    const rendererRel = `sections/${entry.kind}/${rendererArtifact}`;
    const rendererPath = path.join(srcRoot, rendererRel);
    if (!fs.existsSync(rendererPath)) continue;

    const expectedModulePath = rendererRel
      .replace(/\.tsx?$/, "")
      .replace(/\\/g, "/");

    if (!registryIsPlaceholder && !registrySource.includes(expectedModulePath)) {
      problems.push(
        `metadata-ui registry: ${rendererRel} must be registered as modulePath "${expectedModulePath}" in renderer-registry.server.ts`,
      );
    }
  }
}

export function scanMetadataUiSectionContract(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, problems } = input;

  for (const entry of METADATA_UI_SECTION_CONTRACT) {
    const schemaPath = path.join(srcRoot, "schemas", entry.schema);
    if (!fs.existsSync(schemaPath)) {
      problems.push(
        `metadata-ui section contract: missing schemas/${entry.schema} for section kind "${entry.kind}"`,
      );
    }

    const builderPath = path.join(srcRoot, "builders", entry.builder);
    if (!fs.existsSync(builderPath)) {
      problems.push(
        `metadata-ui section contract: missing builders/${entry.builder} for section kind "${entry.kind}"`,
      );
    }

    for (const artifact of [entry.section, entry.renderer]) {
      if (!artifact) continue;
      const artifactPath = findSectionArtifact(srcRoot, entry.kind, artifact);
      if (!artifactPath) {
        problems.push(
          `metadata-ui section contract: missing ${artifact} for section kind "${entry.kind}"`,
        );
      }
    }
  }
}

export function scanMetadataUiSpacingContracts(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  const { srcRoot, packageRel, problems } = input;
  const requiredSourceTokens = [
    {
      rel: "sections/page-header/page-header-renderer.server.tsx",
      token: 'className={cn("metadata-ui-page-header grid", ui.surfaceGap.md)}',
      label:
        "page-header renderer must attach surface gap tokens to a grid container",
    },
    {
      rel: "shell/heading.server.tsx",
      token: '"metadata-ui-heading flex min-w-0 items-start justify-between"',
      label:
        "heading shell must attach horizontal gap tokens to a flex container",
    },
    {
      rel: "shell/heading.server.tsx",
      token: 'className={cn("grid min-w-0", ui.surfaceGap.xs)}',
      label:
        "heading shell title stack must attach vertical gap tokens to a grid container",
    },
    {
      rel: "shell/section-shell.server.tsx",
      token: 'className={cn("metadata-ui-section-shell grid", ui.surfaceGap.md)}',
      label:
        "section shell must attach surface gap tokens to a grid container",
    },
  ] as const;

  for (const { rel, token, label } of requiredSourceTokens) {
    const filePath = path.join(srcRoot, rel);

    if (!fs.existsSync(filePath)) {
      problems.push(
        `metadata-ui spacing: missing ${packageRel}/src/${rel} for spacing contract`,
      );
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");
    if (!source.includes(token)) {
      problems.push(`metadata-ui spacing: ${packageRel}/src/${rel} — ${label}`);
    }
  }
}

function walkSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

export function scanMetadataUiEnforcement(input: {
  srcRoot: string;
  packageRel: string;
  problems: string[];
}) {
  scanMetadataUiRuntimeMarkers(input);
  scanMetadataUiDoors(input);
  scanMetadataUiDependencies(input);
  scanMetadataUiRegistry(input);
  scanMetadataUiProhibitedDiscovery(input);
  scanMetadataUiSectionContract(input);
  scanMetadataUiSpacingContracts(input);
}
