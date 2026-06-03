/**
 * Streaming skeleton / layout parity audit.
 *
 * Catches CLS "drift" that `audit:shadcn-composition` and `audit:governed-design-tokens`
 * do not detect: Suspense fallbacks whose grid geometry diverges from governed stat renderers.
 *
 * Run:
 *   pnpm audit:skeleton-parity
 *   pnpm audit:skeleton-parity --strict
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type Severity = "error" | "warning";

type Violation = {
  file: string;
  line: number;
  ruleId: string;
  message: string;
  severity: Severity;
};

const packageRoot = join(fileURLToPath(import.meta.url), "..", "..");
const repoRoot = join(packageRoot, "..", "..");

function readCanonicalStatGrid(): { compact: string; comfortable: string } {
  const path = join(
    packageRoot,
    "src",
    "stat-card-layout.shared.ts",
  );
  const source = readFileSync(path, "utf8");
  const compact = source.match(
    /compact:\s*"([^"]+)"/,
  )?.[1];
  const comfortable = source.match(
    /comfortable:\s*"([^"]+)"/,
  )?.[1];
  if (!compact || !comfortable) {
    throw new Error(
      "Could not parse GOVERNED_STAT_GRID_CLASS from stat-card-layout.shared.ts",
    );
  }
  return { compact, comfortable };
}

function walkTsx(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkTsx(full));
    } else if (extname(entry) === ".tsx") {
      results.push(full);
    }
  }
  return results;
}

function auditSkeletonParity(
  filePath: string,
  canonical: { compact: string; comfortable: string },
): Violation[] {
  const rel = relative(repoRoot, filePath).replace(/\\/g, "/");
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];

  const isSkeletonModule =
    rel.endsWith("workspace-section-skeletons.tsx") ||
    /Skeleton|skeleton/.test(rel);

  const isStatSkeletonModule = rel.endsWith("workspace-section-skeletons.tsx");

  if (isStatSkeletonModule) {
    if (!content.includes("GOVERNED_STAT_GRID_CLASS")) {
      violations.push({
        file: rel,
        line: 1,
        ruleId: "stat-skeleton-shared-grid",
        message:
          "Stat skeletons must import GOVERNED_STAT_GRID_CLASS from @afenda/governed-surface",
        severity: "error",
      });
    }
    if (!content.includes("GOVERNED_STAT_TILE_SKELETON_CLASS")) {
      violations.push({
        file: rel,
        line: 1,
        ruleId: "stat-skeleton-shared-tile",
        message:
          "Stat tile skeletons must use GOVERNED_STAT_TILE_SKELETON_CLASS",
        severity: "error",
      });
    }
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const lineNumber = index + 1;

    if (/\/\/\s*audit-skeleton:\s*ignore/.test(line)) continue;

    // Stat streaming drift: @lg grid breakpoints on KPI skeletons (renderer uses @2xl).
    if (
      isStatSkeletonModule &&
      /@lg:grid-cols-\d/.test(line)
    ) {
      violations.push({
        file: rel,
        line: lineNumber,
        ruleId: "no-stat-skeleton-lg-grid",
        message:
          "Stat skeleton uses @lg:grid-cols-* — governed stat cards use @sm + @2xl (see GOVERNED_STAT_GRID_CLASS)",
        severity: "error",
      });
    }

    // Inline stat grid that bypasses shared constant in skeleton module.
    if (
      isStatSkeletonModule &&
      /@sm:grid-cols-2/.test(line) &&
      !line.includes("GOVERNED_STAT_GRID_CLASS")
    ) {
      violations.push({
        file: rel,
        line: lineNumber,
        ruleId: "no-inline-stat-grid",
        message:
          "Do not inline stat grid classes — use GOVERNED_STAT_GRID_CLASS.compact",
        severity: "error",
      });
    }

    // Suspense routes: dashboard KPI section must not over-count skeleton tiles.
    if (
      rel.endsWith("dashboard-route.tsx") &&
      /<GovernedStatSectionSkeleton[^>]*statCount=\{4\}/.test(line)
    ) {
      violations.push({
        file: rel,
        line: lineNumber,
        ruleId: "dashboard-kpi-stat-count",
        message:
          "Dashboard module KPIs are 3 metrics — statCount={4} causes streaming layout jump",
        severity: "error",
      });
    }

    // Generic skeleton files: card-wrapped stat fallback when embedded layout is used nearby.
    if (
      rel.endsWith("dashboard-route.tsx") &&
      /<GovernedStatSectionSkeleton\b/.test(line) &&
      !/layout="embedded"/.test(line)
    ) {
      violations.push({
        file: rel,
        line: lineNumber,
        ruleId: "embedded-stat-skeleton-layout",
        message:
          'Dashboard stat Suspense fallbacks should use layout="embedded" to match GovernedPatternBStatSection',
        severity: "warning",
      });
    }

    if (
      rel.endsWith("dashboard-route.tsx") &&
      /@xl:grid-cols-2/.test(line) &&
      /DashboardHardeningSection|HardeningSectionSkeleton/.test(content)
    ) {
      violations.push({
        file: rel,
        line: lineNumber,
        ruleId: "hardening-grid-parity",
        message:
          "Hardening fallback grid must match loaded @xl:grid-cols-[minmax(360px,0.6fr)_minmax(0,1.4fr)]",
        severity: "error",
      });
    }
  }

  if (
    rel.endsWith("dashboard-route.tsx") &&
    /DashboardHardeningSectionSkeleton/.test(content) === false &&
    /DashboardHardeningSection/.test(content) &&
    /fallback=\{[\s\S]*GovernedStatSectionSkeleton[\s\S]*DashboardHardeningSection/.test(
      content,
    )
  ) {
    violations.push({
      file: rel,
      line: 1,
      ruleId: "hardening-stat-skeleton-mismatch",
      message:
        "DashboardHardeningSection loads a chart — use DashboardHardeningSectionSkeleton, not GovernedStatSectionSkeleton",
      severity: "error",
    });
  }

  if (
    rel.endsWith("dashboard-route.tsx") &&
    /DashboardHardeningSection/.test(content) &&
    !/DashboardHardeningSectionSkeleton/.test(content)
  ) {
    violations.push({
      file: rel,
      line: 1,
      ruleId: "hardening-skeleton-required",
      message:
        "DashboardHardeningSection Suspense fallback must use DashboardHardeningSectionSkeleton",
      severity: "error",
    });
  }

  if (rel.endsWith("workspace-section-skeletons.tsx")) {
    if (
      content.includes("DashboardHardeningSectionSkeleton") &&
      !content.includes(
        "@xl:grid-cols-[minmax(360px,0.6fr)_minmax(0,1.4fr)]",
      )
    ) {
      violations.push({
        file: rel,
        line: 1,
        ruleId: "hardening-skeleton-grid-parity",
        message:
          "DashboardHardeningSectionSkeleton must use the same grid as DashboardHardeningSection",
        severity: "error",
      });
    }
    if (
      content.includes("DashboardHardeningSectionSkeleton") &&
      !content.includes("GovernedChartSectionSkeleton")
    ) {
      violations.push({
        file: rel,
        line: 1,
        ruleId: "hardening-skeleton-chart-parity",
        message:
          "DashboardHardeningSectionSkeleton must include GovernedChartSectionSkeleton",
        severity: "error",
      });
    }
  }

  // Renderer must stay aligned with canonical export.
  const rendererPath = join(
    packageRoot,
    "src",
    "metadata",
    "renderers",
    "stat-card.renderer.tsx",
  );
  if (filePath === rendererPath) {
    if (!content.includes("GOVERNED_STAT_GRID_CLASS")) {
      violations.push({
        file: rel,
        line: 1,
        ruleId: "stat-renderer-grid-parity",
        message:
          "stat-card.renderer.tsx must use GOVERNED_STAT_GRID_CLASS from stat-card-layout.shared.ts",
        severity: "error",
      });
    }
  }

  return violations;
}

function main(): void {
  const strict = process.argv.includes("--strict");
  const canonical = readCanonicalStatGrid();

  const scanRoots = [
    join(repoRoot, "apps", "erp", "src", "routes"),
    join(packageRoot, "src", "metadata", "renderers", "stat-card.renderer.tsx"),
  ];

  const files = new Set<string>();
  for (const root of scanRoots) {
    if (root.endsWith(".tsx")) {
      files.add(root);
    } else {
      for (const file of walkTsx(root)) {
        files.add(file);
      }
    }
  }

  const violations: Violation[] = [];
  for (const file of files) {
    violations.push(...auditSkeletonParity(file, canonical));
  }

  console.log("Streaming skeleton parity audit");
  console.log("=".repeat(50));
  console.log(`Canonical compact grid: ${canonical.compact}`);
  console.log();

  if (violations.length === 0) {
    console.log("No skeleton/layout drift violations found.");
    console.log();
    console.log(
      "Note: audit:shadcn-composition only checks space-y, raw buttons, and tile divs.",
    );
    console.log(
      "      audit:governed-design-tokens checks typography/radius/z-index tokens.",
    );
    console.log(
      "      This script covers Suspense skeleton ↔ governed renderer geometry.",
    );
    return;
  }

  for (const v of violations) {
    console.log(
      `[${v.severity.padEnd(7)}]  ${v.file}:${v.line}  [${v.ruleId}]  ${v.message}`,
    );
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warning").length;
  console.log();
  console.log(`Total: ${violations.length} (${errorCount} errors, ${warnCount} warnings)`);

  if (strict && (errorCount > 0 || warnCount > 0)) {
    process.exit(1);
  }
}

main();
