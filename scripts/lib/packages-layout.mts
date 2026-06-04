/**
 * packages/ src layout — GUARD 5
 *
 * single-feature  → src/ flat
 * multi-feature   → src/features/<slice>/ flat
 * tiered-feature  → src/<feature>/<sub-feature>/ flat (HR Suite)
 */

import fs from "node:fs";
import path from "node:path";
import {
  featureFlatFileViolation,
  featurePackageCode,
  featurePublicDoorFiles,
  featureTemplateBuckets,
  isBannedBucketName,
  legacyFeatureSliceFolders,
} from "../../packages/_scaffold/scripts/lib/scaffold-grammar.mts";
import {
  METADATA_UI_LAYOUT,
  isMetadataUiRuntimePackage,
} from "./metadata-ui-layout.mts";

export const PACKAGES_LAYOUT_FAIL_BANNER =
  "YOUR MOTHER OR FATHER IS A WHORE, FUCK OFF AND CORRECT IT";

export const FEATURES_CONTAINER = "features";

export const MULTI_FEATURE_PACKAGES = new Set(["system-admin"]);

export const TIERED_FEATURE_PACKAGES = new Set(["hr-suite", "object-storage"]);

/** HR Suite layer-1 feature domains (src/<feature>/). */
export const HR_SUITE_FEATURE_DOMAINS = [
  "employee-management",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
  "hr-suite-integration",
] as const;

/** Layer-1 folders that flatten at feature root (no layer-2 sub-feature). */
export const HR_SUITE_FLAT_FEATURE_ROOTS = new Set(["hr-suite-integration"]);

/** Shipped DB flat file naming (schema modules at src root). */
export const DB_FLAT_FILE =
  /^(?:dbx-|hr-|db-)[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:ts|tsx)$/;

/** system-admin shipped dot notation in feature slices. */
export const SYSTEM_ADMIN_SLICE_FILE =
  /^system-admin\.[a-z0-9.-]+\.(?:ts|tsx)$/;

/** Shipped HR flat file naming (layer 3). */
export const HR_TIERED_FLAT_FILE =
  /^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)*\.[a-z0-9-]+\.(?:actions\.server|policy\.server|page-model\.server|shared\.server|surface|shared|schema|contract|event|component\.(?:client|server))\.tsx?$/;

export const LEGACY_BUCKET_DIRS = new Set<string>([
  ...featureTemplateBuckets,
  ...legacyFeatureSliceFolders,
]);

export const SHIM_EXPORT_DOORS = new Set(["platform-tools", "internal", "shim"]);

const BUCKET_BARREL_RE =
  /export\s+\*\s+from\s+["']\.\/(actions|agents|api|data|tools|contracts|schemas|policies|prompts|errors|events|components)["']/;

export const PACKAGE_CODE_OVERRIDES: Record<string, string> = {
  ai: "ai",
};

/** Packages with legacy root filenames (no {code}- prefix required). */
export const RELAXED_FLAT_NAMING_PACKAGES = new Set([
  "billing",
  "config",
  "workflows",
  "public-homepage",
  "observability",
  "ui",
  "appshell",
  "governed-surface",
  "kernel",
  "object-storage",
]);

export type PackageLayoutMode =
  | "single-feature"
  | "multi-feature"
  | "tiered-feature"
  | "metadata-ui-runtime";

export type TieredLayoutConfig = {
  featureDomains: readonly string[];
  flatFeatureRoots: ReadonlySet<string>;
};

export type PackageScanTarget = {
  packageDirName: string;
  packageRel: string;
  srcRoot: string;
  packageDir: string;
};

export function packageSrcCode(packageDirName: string) {
  return PACKAGE_CODE_OVERRIDES[packageDirName] ?? featurePackageCode(packageDirName);
}

export function isPublicDoor(fileName: string) {
  if (
    fileName === "index.tsx" ||
    fileName === "client.tsx" ||
    fileName === "styles.css"
  ) {
    return true;
  }
  return featurePublicDoorFiles.includes(
    fileName as (typeof featurePublicDoorFiles)[number],
  );
}

export function flatFilePatternForCode(code: string) {
  return new RegExp(
    `^${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[a-z0-9-]+(\\.[a-z0-9-]+)*\\.(ts|tsx)$`,
  );
}

export function readPackageAfendaConfig(packageDir: string) {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    afenda?: {
      layout?: string;
      tiered?: {
        featureDomains?: string[];
        flatAtFeatureRoot?: string[];
      };
    };
  };
}

export function readDeclaredLayout(packageDir: string): PackageLayoutMode | null {
  const layout = readPackageAfendaConfig(packageDir)?.afenda?.layout;
  if (
    layout === "multi-feature" ||
    layout === "single-feature" ||
    layout === "tiered-feature" ||
    layout === METADATA_UI_LAYOUT
  ) {
    return layout;
  }
  return null;
}

export function readTieredLayoutConfig(
  target: PackageScanTarget,
): TieredLayoutConfig {
  const tiered = readPackageAfendaConfig(target.packageDir)?.afenda?.tiered;

  if (target.packageDirName === "hr-suite") {
    return {
      featureDomains: tiered?.featureDomains ?? HR_SUITE_FEATURE_DOMAINS,
      flatFeatureRoots: new Set(
        tiered?.flatAtFeatureRoot ?? [...HR_SUITE_FLAT_FEATURE_ROOTS],
      ),
    };
  }

  if (target.packageDirName === "object-storage") {
    return {
      featureDomains: tiered?.featureDomains ?? [
        "blob",
        "r2",
        "s3",
        "_object-storage-integration",
      ],
      flatFeatureRoots: new Set(tiered?.flatAtFeatureRoot ?? []),
    };
  }

  return {
    featureDomains: tiered?.featureDomains ?? [],
    flatFeatureRoots: new Set(tiered?.flatAtFeatureRoot ?? []),
  };
}

export function resolvePackageLayoutMode(target: PackageScanTarget): PackageLayoutMode {
  const declared = readDeclaredLayout(target.packageDir);
  if (declared) return declared;

  if (isMetadataUiRuntimePackage(target.packageDirName)) {
    return METADATA_UI_LAYOUT;
  }

  if (TIERED_FEATURE_PACKAGES.has(target.packageDirName)) {
    return "tiered-feature";
  }

  if (MULTI_FEATURE_PACKAGES.has(target.packageDirName)) {
    return "multi-feature";
  }

  const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);
  if (fs.existsSync(featuresRoot) && fs.statSync(featuresRoot).isDirectory()) {
    const slices = fs
      .readdirSync(featuresRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());
    if (slices.length > 0) {
      return "multi-feature";
    }
  }

  return "single-feature";
}

export function tieredFlatFileViolation(
  fileName: string,
  code: string,
  packageDirName: string,
): string | null {
  if (isPublicDoor(fileName)) return null;
  if (fileName.endsWith(".md")) return null;
  if (fileName === "index.ts" || fileName === ".gitkeep") return null;

  if (packageDirName === "hr-suite" && HR_TIERED_FLAT_FILE.test(fileName)) {
    return null;
  }

  if (
    packageDirName === "hr-suite" &&
    (/^hr\.[a-z0-9.-]+\.(?:ts|tsx)$/.test(fileName) ||
      /^[a-z0-9.-]+\.server\.ts$/.test(fileName))
  ) {
    return null;
  }

  return packageFlatFileViolation(fileName, code, {
    allowIndex: true,
    packageDirName,
  });
}

export function systemAdminSliceFileViolation(
  fileName: string,
  code: string,
): string | null {
  if (isPublicDoor(fileName)) return null;
  if (fileName.endsWith(".md")) return null;
  if (SYSTEM_ADMIN_SLICE_FILE.test(fileName)) return null;
  if (flatFilePatternForCode(code).test(fileName)) return null;
  return packageFlatFileViolation(fileName, code, {
    allowIndex: true,
    packageDirName: "system-admin",
  });
}

export function packageFlatFileViolation(
  fileName: string,
  code: string,
  options?: { allowIndex?: boolean; packageDirName?: string },
): string | null {
  if (isPublicDoor(fileName)) return null;
  if (fileName.endsWith(".md")) return null;
  if (options?.allowIndex && fileName === "index.ts") return null;

  if (options?.packageDirName === "db" && DB_FLAT_FILE.test(fileName)) {
    return null;
  }

  if (
    options?.packageDirName === "db" &&
    /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.(?:ts|tsx)$/.test(fileName) &&
    !isPublicDoor(fileName)
  ) {
    return null;
  }

  if (
    options?.packageDirName &&
    RELAXED_FLAT_NAMING_PACKAGES.has(options.packageDirName) &&
    /^[a-z0-9][a-z0-9-_.]*(\.[a-z0-9-]+)*\.(?:ts|tsx|css|json)$/.test(fileName) &&
    !isPublicDoor(fileName)
  ) {
    return null;
  }

  const pattern = flatFilePatternForCode(code);
  if (pattern.test(fileName)) return null;

  const scaffoldMsg = featureFlatFileViolation(fileName);
  if (scaffoldMsg) {
    return `${scaffoldMsg} (expected prefix ${code}-)`;
  }

  return `invalid flat file "${fileName}" — use ${code}-{topic}.{artifact}.{canonical}.ts`;
}

export function packageExportDoorViolation(exportKey: string): string | null {
  const normalized = exportKey.replace(/^\.\//, "");
  if (SHIM_EXPORT_DOORS.has(normalized)) {
    return `GUARD 5: remove package.json export "./${normalized}" — no shim doors. ${PACKAGES_LAYOUT_FAIL_BANNER}`;
  }
  return null;
}

export function packageShimSourceViolations(
  relPath: string,
  source: string,
): string[] {
  const normalized = relPath.replace(/\\/g, "/");
  if (!normalized.startsWith("packages/")) return [];

  const problems: string[] = [];

  if (/export\s+\*\s+from\s+["']\.\/index["']/.test(source)) {
    problems.push(
      `GUARD 5: ${normalized} re-exports ./index — use direct flat exports. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }

  if (/from\s+["']@afenda\/[^"']+\/platform-tools["']/.test(source)) {
    problems.push(
      `GUARD 5: ${normalized} imports platform-tools shim door. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }

  if (
    (normalized.endsWith("/server.ts") || normalized.endsWith("/client.ts")) &&
    BUCKET_BARREL_RE.test(source)
  ) {
    problems.push(
      `GUARD 5: ${normalized} re-exports bucket barrels — export flat files directly. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }

  return problems;
}

export function listPackageScanTargets(packagesRoot: string): PackageScanTarget[] {
  const targets: PackageScanTarget[] = [];

  for (const entry of fs.readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    if (entry.name === "features") {
      const featuresRoot = path.join(packagesRoot, "features");
      if (!fs.existsSync(featuresRoot)) continue;

      for (const featureEntry of fs.readdirSync(featuresRoot, {
        withFileTypes: true,
      })) {
        if (!featureEntry.isDirectory()) continue;
        const packageDir = path.join(featuresRoot, featureEntry.name);
        const srcRoot = path.join(packageDir, "src");
        if (!fs.existsSync(srcRoot)) continue;

        targets.push({
          packageDirName: featureEntry.name,
          packageRel: `packages/features/${featureEntry.name}`,
          srcRoot,
          packageDir,
        });
      }
      continue;
    }

    const packageDir = path.join(packagesRoot, entry.name);
    const srcRoot = path.join(packageDir, "src");
    if (!fs.existsSync(srcRoot)) continue;

    targets.push({
      packageDirName: entry.name,
      packageRel: `packages/${entry.name}`,
      srcRoot,
      packageDir,
    });
  }

  return targets;
}

export function scanPackageSrc(
  target: PackageScanTarget,
  problems: string[],
): PackageLayoutMode {
  const mode = resolvePackageLayoutMode(target);
  if (mode === METADATA_UI_LAYOUT) {
    return mode;
  }
  if (mode === "tiered-feature") {
    scanTieredFeaturePackage(target, problems);
  } else if (mode === "multi-feature") {
    scanMultiFeaturePackage(target, problems);
  } else {
    scanSingleFeaturePackage(target, problems);
  }
  return mode;
}

function scanSingleFeaturePackage(
  target: PackageScanTarget,
  problems: string[],
) {
  scanFlatDirectory({
    dir: target.srcRoot,
    rel: `${target.packageRel}/src`,
    code: packageSrcCode(target.packageDirName),
    packageDirName: target.packageDirName,
    problems,
    context: "single-feature src/",
  });
}

function scanMultiFeaturePackage(
  target: PackageScanTarget,
  problems: string[],
) {
  const code = packageSrcCode(target.packageDirName);
  const srcRel = `${target.packageRel}/src`;
  const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);

  for (const entry of fs.readdirSync(target.srcRoot, { withFileTypes: true })) {
    const rel = `${srcRel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (entry.name === FEATURES_CONTAINER) continue;
      if (LEGACY_BUCKET_DIRS.has(entry.name)) {
        problems.push(
          `GUARD 5: ${rel}/ — multi-feature: move to src/features/<slice>/ and flatten. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
      } else {
        problems.push(
          `GUARD 5: ${rel}/ — multi-feature: use src/features/${entry.name}/ and flatten. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
      }
      reportNestedLegacy(path.join(target.srcRoot, entry.name), rel, code, problems);
      continue;
    }

    if (!entry.isFile()) continue;

    if (isPublicDoor(entry.name) || entry.name.endsWith(".md")) {
      checkSourceFile(path.join(target.srcRoot, entry.name), rel, problems);
      continue;
    }

    problems.push(
      `GUARD 5: ${rel} — multi-feature src/ allows only public doors + features/. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }

  if (!fs.existsSync(featuresRoot)) {
    problems.push(
      `GUARD 5: ${srcRel}/${FEATURES_CONTAINER}/ — multi-feature requires src/features/<slice>/. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
    return;
  }

  for (const entry of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
    const rel = `${srcRel}/${FEATURES_CONTAINER}/${entry.name}`;

    if (entry.isFile()) {
      if (entry.name === ".gitkeep") continue;
      problems.push(
        `GUARD 5: ${rel} — put files inside src/features/<slice>/. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
      );
      continue;
    }

    if (!entry.isDirectory()) continue;

    scanFlatDirectory({
      dir: path.join(featuresRoot, entry.name),
      rel,
      code,
      packageDirName: target.packageDirName,
      problems,
      context: `feature slice ${entry.name}`,
    });
  }
}

function scanTieredFeaturePackage(
  target: PackageScanTarget,
  problems: string[],
) {
  const config = readTieredLayoutConfig(target);
  const allowedFeatures = new Set(config.featureDomains);
  const code = packageSrcCode(target.packageDirName);
  const srcRel = `${target.packageRel}/src`;

  for (const entry of fs.readdirSync(target.srcRoot, { withFileTypes: true })) {
    const rel = `${srcRel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (entry.name === FEATURES_CONTAINER) {
        problems.push(
          `GUARD 5: ${rel}/ — tiered-feature uses src/<feature>/<sub-feature>/, not src/features/. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
        reportNestedLegacy(path.join(target.srcRoot, entry.name), rel, code, problems);
        continue;
      }

      if (LEGACY_BUCKET_DIRS.has(entry.name)) {
        problems.push(
          `GUARD 5: ${rel}/ — tiered-feature: no root buckets; use src/<feature>/<sub-feature>/. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
        reportNestedLegacy(path.join(target.srcRoot, entry.name), rel, code, problems);
        continue;
      }

      if (!allowedFeatures.has(entry.name)) {
        problems.push(
          `GUARD 5: ${rel}/ — unknown tiered feature domain; declare in afenda.tiered.featureDomains. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
        reportNestedLegacy(path.join(target.srcRoot, entry.name), rel, code, problems);
        continue;
      }

      scanTieredFeatureDomain({
        featureDir: path.join(target.srcRoot, entry.name),
        featureRel: rel,
        featureName: entry.name,
        config,
        code,
        packageDirName: target.packageDirName,
        problems,
      });
      continue;
    }

    if (!entry.isFile()) continue;

    if (isPublicDoor(entry.name) || entry.name.endsWith(".md")) {
      checkSourceFile(path.join(target.srcRoot, entry.name), rel, problems);
      continue;
    }

    problems.push(
      `GUARD 5: ${rel} — tiered-feature src/ allows only package doors + feature domains. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }
}

function scanTieredFeatureDomain(input: {
  featureDir: string;
  featureRel: string;
  featureName: string;
  config: TieredLayoutConfig;
  code: string;
  packageDirName: string;
  problems: string[];
}) {
  const {
    featureDir,
    featureRel,
    featureName,
    config,
    code,
    packageDirName,
    problems,
  } = input;

  if (config.flatFeatureRoots.has(featureName)) {
    scanFlatDirectory({
      dir: featureDir,
      rel: featureRel,
      code,
      packageDirName,
      problems,
      context: `tiered feature root ${featureName}`,
    });
    return;
  }

  for (const entry of fs.readdirSync(featureDir, { withFileTypes: true })) {
    const rel = `${featureRel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) {
        scanFlatDirectory({
          dir: path.join(featureDir, entry.name),
          rel,
          code,
          packageDirName,
          problems,
          context: `integration folder ${featureName}/${entry.name}`,
          tiered: true,
        });
        continue;
      }

      scanTieredSubFeature({
        subFeatureDir: path.join(featureDir, entry.name),
        subFeatureRel: rel,
        subFeatureName: entry.name,
        code,
        packageDirName,
        problems,
      });
      continue;
    }

    if (!entry.isFile()) continue;

    problems.push(
      `GUARD 5: ${rel} — tiered layer 2: files belong in src/${featureName}/<sub-feature>/ (flatten layer 3). ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }
}

function scanTieredSubFeature(input: {
  subFeatureDir: string;
  subFeatureRel: string;
  subFeatureName: string;
  code: string;
  packageDirName: string;
  problems: string[];
}) {
  scanFlatDirectory({
    dir: input.subFeatureDir,
    rel: input.subFeatureRel,
    code: input.code,
    packageDirName: input.packageDirName,
    problems: input.problems,
    context: `sub-feature ${input.subFeatureName}`,
    tiered: true,
  });
}

function scanFlatDirectory(input: {
  dir: string;
  rel: string;
  code: string;
  packageDirName: string;
  problems: string[];
  context: string;
  tiered?: boolean;
}) {
  const { dir, rel, code, packageDirName, problems, context, tiered } = input;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const childRel = `${rel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (entry.name === "tests") continue;
      if (LEGACY_BUCKET_DIRS.has(entry.name)) {
        problems.push(
          `GUARD 5: ${childRel}/ — legacy bucket in ${context}; flatten layer 3. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
      } else {
        problems.push(
          `GUARD 5: ${childRel}/ — ${context} must stay flat. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
      }
      reportNestedLegacy(path.join(dir, entry.name), childRel, code, problems);
      continue;
    }

    if (!entry.isFile()) continue;

    const namingViolation = tiered
      ? tieredFlatFileViolation(entry.name, code, packageDirName)
      : packageDirName === "system-admin"
        ? systemAdminSliceFileViolation(entry.name, code)
        : packageFlatFileViolation(entry.name, code, {
            allowIndex: true,
            packageDirName,
          });

    if (namingViolation) {
      problems.push(`GUARD 5: ${childRel}: ${namingViolation} ${PACKAGES_LAYOUT_FAIL_BANNER}`);
    }

    checkSourceFile(path.join(dir, entry.name), childRel, problems);
  }
}

function checkSourceFile(
  filePath: string,
  rel: string,
  problems: string[],
) {
  if (!/\.(ts|tsx)$/.test(filePath)) return;
  const source = fs.readFileSync(filePath, "utf8");
  problems.push(...packageShimSourceViolations(rel, source));
}

function reportNestedLegacy(
  dir: string,
  rel: string,
  code: string,
  problems: string[],
) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const childRel = `${rel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (isBannedBucketName(entry.name)) {
        problems.push(
          `GUARD 5: ${childRel}/ — banned folder. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
        );
      }
      reportNestedLegacy(path.join(dir, entry.name), childRel, code, problems);
      continue;
    }

    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

    problems.push(
      `GUARD 5: ${childRel} — nested legacy file; flatten at the correct layer. ${PACKAGES_LAYOUT_FAIL_BANNER}`,
    );
  }
}

export function scanPackageJsonExports(
  packageDir: string,
  packageRel: string,
  problems: string[],
) {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return;

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    exports?: Record<string, unknown>;
  };

  for (const exportKey of Object.keys(pkg.exports ?? {})) {
    const violation = packageExportDoorViolation(exportKey);
    if (violation) {
      problems.push(`${packageRel}: ${violation}`);
    }
  }
}
