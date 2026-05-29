/**
 * Filesystem inventory of afenda-vercel HRM (no database).
 * Run from repo root:
 *   pnpm hr:inventory-legacy
 *   HRM_LEGACY_ROOT=D:\other\afenda-vercel pnpm hr:inventory-legacy
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(packageRoot, "../../..");

const DEFAULT_LEGACY_ROOT = path.resolve(repoRoot, "../afenda-vercel");

type CapabilityInventory = {
  capabilityId: string;
  relativePath: string;
  fileCount: number;
  tsCount: number;
  tsxCount: number;
  queryFiles: number;
  mutationFiles: number;
  trackSlice: number | null;
  trackTarget: string | null;
};

type WorkspaceInventory = {
  workspaceId: string;
  capabilityCount: number;
  fileCount: number;
  tsCount: number;
  tsxCount: number;
  capabilities: CapabilityInventory[];
};

const TRACK_SLICE_HINTS: ReadonlyArray<{
  slice: number;
  target: string;
  capabilityPatterns: readonly string[];
}> = [
  {
    slice: 0,
    target: "contracts, metadata",
    capabilityPatterns: ["core"],
  },
  {
    slice: 1,
    target: "workforce",
    capabilityPatterns: [
      "employee-records-management",
      "organizational-chart-hierarchy",
    ],
  },
  {
    slice: 2,
    target: "workforce/documents, lifecycle, compliance",
    capabilityPatterns: [
      "documents-management",
      "employee-lifecycle-management",
      "offboarding-exit-management",
      "compliance-regulatory-tracking",
      "employee-selfservice-portal",
    ],
  },
  {
    slice: 3,
    target: "time-attendance",
    capabilityPatterns: [
      "leave-attendance-management",
      "overtime-management",
      "shift-scheduling",
      "time-clock-integration",
    ],
  },
  {
    slice: 5,
    target: "payroll",
    capabilityPatterns: [
      "payroll-processing",
      "multi-country-payroll",
      "compensation-planning-modeling",
    ],
  },
  {
    slice: 8,
    target: "talent",
    capabilityPatterns: [
      "recruitment-onboarding",
      "candidate-selfservice-portal",
      "learning-management-system-lms",
      "performance-appraisals",
    ],
  },
  {
    slice: 11,
    target: "industry",
    capabilityPatterns: [
      "government-classification-pay-grades",
      "food-handler-certification-health-compliance",
      "field-worker-remote-workforce-management",
    ],
  },
];

function resolveSlice(capabilityId: string): {
  slice: number | null;
  target: string | null;
} {
  for (const hint of TRACK_SLICE_HINTS) {
    if (
      hint.capabilityPatterns.some((pattern) => capabilityId.includes(pattern))
    ) {
      return { slice: hint.slice, target: hint.target };
    }
  }
  return { slice: null, target: null };
}

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

function countByExtension(files: string[]) {
  let ts = 0;
  let tsx = 0;
  let queryFiles = 0;
  let mutationFiles = 0;
  for (const file of files) {
    if (file.endsWith(".ts")) ts += 1;
    if (file.endsWith(".tsx")) tsx += 1;
    const base = path.basename(file);
    if (base.includes(".queries.") || base.endsWith(".queries.server.ts")) {
      queryFiles += 1;
    }
    if (base.includes(".mutations.") || base.endsWith(".mutations.server.ts")) {
      mutationFiles += 1;
    }
    if (base.includes(".mutation.") || base.endsWith(".mutation.server.ts")) {
      mutationFiles += 1;
    }
  }
  return { ts, tsx, queryFiles, mutationFiles, total: files.length };
}

function inventoryCapability(
  workspaceId: string,
  capabilityDir: string,
): CapabilityInventory {
  const capabilityId = path.basename(capabilityDir);
  const files = listFilesRecursive(capabilityDir);
  const counts = countByExtension(files);
  const { slice, target } = resolveSlice(capabilityId);
  return {
    capabilityId,
    relativePath: path
      .relative(path.join(legacyRoot, "packages/features/hrm"), capabilityDir)
      .replaceAll("\\", "/"),
    fileCount: counts.total,
    tsCount: counts.ts,
    tsxCount: counts.tsx,
    queryFiles: counts.queryFiles,
    mutationFiles: counts.mutationFiles,
    trackSlice: slice,
    trackTarget: target,
  };
}

function inventoryWorkspace(workspaceDir: string): WorkspaceInventory {
  const workspaceId = path.basename(workspaceDir);
  const srcDir = path.join(workspaceDir, "src");
  const capabilities: CapabilityInventory[] = [];

  if (!fs.existsSync(srcDir)) {
    return {
      workspaceId,
      capabilityCount: 0,
      fileCount: 0,
      tsCount: 0,
      tsxCount: 0,
      capabilities,
    };
  }

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const capabilityDir = path.join(srcDir, entry.name);
    capabilities.push(inventoryCapability(workspaceId, capabilityDir));
  }

  capabilities.sort((a, b) => b.fileCount - a.fileCount);

  return {
    workspaceId,
    capabilityCount: capabilities.length,
    fileCount: capabilities.reduce((sum, row) => sum + row.fileCount, 0),
    tsCount: capabilities.reduce((sum, row) => sum + row.tsCount, 0),
    tsxCount: capabilities.reduce((sum, row) => sum + row.tsxCount, 0),
    capabilities,
  };
}

function inventoryHrmTables(schemaPath: string): string[] {
  if (!fs.existsSync(schemaPath)) return [];
  const source = fs.readFileSync(schemaPath, "utf8");
  const tables = new Set<string>();
  const tableRe = /pgTable\(\s*["'](hrm_[^"']+)["']/g;
  for (const match of source.matchAll(tableRe)) {
    tables.add(match[1] ?? "");
  }
  return [...tables].sort();
}

const legacyRoot = path.resolve(
  process.env.HRM_LEGACY_ROOT?.trim() || DEFAULT_LEGACY_ROOT,
);
const hrmRoot = path.join(legacyRoot, "packages/features/hrm");
const schemaPath = path.join(legacyRoot, "packages/platform/src/db/schema.ts");
const outputDir = path.join(packageRoot, "migration");
const outputPath = path.join(outputDir, "legacy-inventory.generated.json");

if (!fs.existsSync(hrmRoot)) {
  console.error(
    `[inventory-legacy-hrm] HRM path not found: ${hrmRoot}\nSet HRM_LEGACY_ROOT to your afenda-vercel checkout.`,
  );
  process.exit(1);
}

const workspaces: WorkspaceInventory[] = [];
for (const entry of fs.readdirSync(hrmRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  workspaces.push(inventoryWorkspace(path.join(hrmRoot, entry.name)));
}

workspaces.sort((a, b) => b.fileCount - a.fileCount);

const totals = workspaces.reduce(
  (acc, row) => {
    acc.fileCount += row.fileCount;
    acc.tsCount += row.tsCount;
    acc.tsxCount += row.tsxCount;
    acc.capabilityCount += row.capabilityCount;
    return acc;
  },
  { fileCount: 0, tsCount: 0, tsxCount: 0, capabilityCount: 0 },
);

const hrmTables = inventoryHrmTables(schemaPath);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  legacyRoot,
  hrmRoot,
  schemaPath,
  schemaPresent: fs.existsSync(schemaPath),
  totals,
  hrmTableCount: hrmTables.length,
  hrmTables,
  workspaces,
  nextSlice: {
    id: 1,
    status: "partial",
    focus: "Complete Slice 1b: hr_employee_assignments, create/update/archive, audit",
    legacyCapabilities: [
      "employee-records-management",
      "organizational-chart-hierarchy",
    ],
  },
  factoryLoop: [
    "pnpm hr:inventory-legacy",
    "Pick one capability from current slice (legacy inventory)",
    "Schema in packages/db → pnpm db:generate → pnpm db:migrate",
    "Implement in packages/features/hr/src/<vertical>/ (system-admin pattern)",
    "Thin adapter in apps/erp/src/lib/hr-sections/",
    "Tests + TRACK-004 evidence bundle → merge → next capability",
  ],
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`[inventory-legacy-hrm] legacy root: ${legacyRoot}`);
console.log(
  `[inventory-legacy-hrm] workspaces: ${workspaces.length}, capabilities: ${totals.capabilityCount}, files: ${totals.fileCount} (${totals.tsCount} ts, ${totals.tsxCount} tsx)`,
);
console.log(
  `[inventory-legacy-hrm] hrm_* tables in schema: ${hrmTables.length} (${schemaPath})`,
);
console.log(`[inventory-legacy-hrm] wrote ${outputPath}`);
console.log("");
console.log("Top capabilities by file count:");
for (const workspace of workspaces.slice(0, 3)) {
  console.log(`  ${workspace.workspaceId} (${workspace.fileCount} files)`);
  for (const capability of workspace.capabilities.slice(0, 5)) {
    const slice =
      capability.trackSlice === null
        ? "unmapped"
        : `slice ${capability.trackSlice}`;
    console.log(
      `    - ${capability.capabilityId}: ${capability.fileCount} files, ${capability.queryFiles} queries, ${capability.mutationFiles} mutations → ${slice}`,
    );
  }
}
