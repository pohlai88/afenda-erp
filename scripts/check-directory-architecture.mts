import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appRouteAllowedTsxNames,
  bannedBucketNames,
  featurePublicDoorFiles,
  readTemplateBuckets,
} from "../packages/_template-definition/scripts/lib/feature-bucket-grammar.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems: string[] = [];

type WorkspaceRoot = "apps" | "packages";
type PackageCategory =
  | "next-app"
  | "runtime-library"
  | "ui-primitives"
  | "config"
  | "database"
  | "feature-package";

type PackageArchitectureRule = {
  category: PackageCategory;
  workspaceRoot: WorkspaceRoot;
  requiresCompiledDistExports: boolean;
  requiresPackageBuild: boolean;
  turboBuildOutputs: string[];
};

type WorkspacePackage = {
  workspaceRoot: WorkspaceRoot;
  packageDirectory: string;
  directoryName: string;
  packageJsonPath: string;
  packageJson: Record<string, unknown>;
};

type WorkspacePackageWithName = WorkspacePackage & {
  packageName: string;
  rule: PackageArchitectureRule;
};

const packageArchitectureRules: Record<string, PackageArchitectureRule> = {
  "@afenda/erp": {
    category: "next-app",
    workspaceRoot: "apps",
    requiresCompiledDistExports: false,
    requiresPackageBuild: false,
    turboBuildOutputs: [".next/**", "!.next/cache/**"],
  },
  "@afenda/ai": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/appshell": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/auth": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/billing": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/config": {
    category: "config",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/db": {
    category: "database",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/kernel": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/governed-surface": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/observability": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/ui": {
    category: "ui-primitives",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
  "@afenda/workflows": {
    category: "runtime-library",
    workspaceRoot: "packages",
    requiresCompiledDistExports: true,
    requiresPackageBuild: true,
    turboBuildOutputs: ["dist/**"],
  },
};

const ignoredDirectories = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".artifacts",
  ".vercel",
  ".agents",
  ".cursor",
  "dist",
  ".codex-runtime",
  ".codex-logs",
  ".playwright-mcp",
]);

/** Root `artifacts/` (no dot) collides with gitignored `.artifacts/` for test output. */
const disallowedRootDirectoryNames = new Set(["artifacts"]);

const disallowedRootFileNames = new Set([
  "build-log.txt",
  "dashboard-snapshot.yml",
]);

const disallowedRootFilePatterns = [/^page-[\dTZ:.-]+\.ya?ml$/i, /-snapshot\.ya?ml$/i];

const allowedUppercaseMarkdownFiles = new Set(["README.md", "AGENTS.md"]);
const staleDocumentationReferences = [
  "afenda-architecture.md",
  "packages/governed-surface/src/metadata/ARCHITECTURE.md",
  "docs/afenda-ai-operation-execution-layer-draft.md",
  "afenda-ai-operation-execution-layer-draft.md",
];

function normalize(value: string) {
  return value.split(path.sep).join("/");
}

function relativePath(value: string) {
  return normalize(path.relative(root, value));
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
}

function isIgnoredDirectory(name: string) {
  return ignoredDirectories.has(name);
}

function isGeneratedSourceFile(filePath: string) {
  const rel = relativePath(filePath);
  const segments = rel.split("/");

  return (
    segments.includes("src") &&
    (rel.endsWith(".js") || rel.endsWith(".d.ts") || rel.endsWith(".d.ts.map"))
  );
}

function isMarkdownFile(filePath: string) {
  return filePath.endsWith(".md");
}

function isSourceFile(filePath: string) {
  return (
    filePath.endsWith(".ts") ||
    filePath.endsWith(".tsx") ||
    filePath.endsWith(".mts") ||
    filePath.endsWith(".cts")
  );
}

function parseFeaturePath(relativePath: string) {
  const rootMatch = relativePath.match(
    /^packages\/features\/([^/]+)\/(?!src\/)(.+)$/,
  );
  if (rootMatch && !relativePath.includes("/src/")) {
    return {
      featureName: rootMatch[1] ?? "",
      afterBase: rootMatch[2] ?? "",
      legacy: false,
    };
  }

  const srcMatch = relativePath.match(
    /^packages\/features\/([^/]+)\/src(?:\/(.*))?$/,
  );
  if (!srcMatch) {
    return null;
  }
  return {
    featureName: srcMatch[1] ?? "",
    afterBase: srcMatch[2] ?? "",
    legacy: true,
  };
}

function resolveFeatureBaseDir(featureDir: string) {
  if (fs.existsSync(path.join(featureDir, "index.ts"))) {
    return { baseDir: featureDir, legacy: false };
  }
  const srcDir = path.join(featureDir, "src");
  if (fs.existsSync(path.join(srcDir, "index.ts"))) {
    return { baseDir: srcDir, legacy: true };
  }
  return { baseDir: featureDir, legacy: false };
}

function isExternalMarkdownTarget(target: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#");
}

function getMarkdownLinkTarget(rawTarget: string) {
  return rawTarget.trim().replace(/^<|>$/g, "").split("#")[0];
}

function checkDocumentationNaming(filePath: string) {
  if (!isMarkdownFile(filePath)) {
    return;
  }

  const rel = relativePath(filePath);
  const fileName = path.basename(filePath);
  const lowerFileName = fileName.toLowerCase();
  const isAllowedUppercaseMarkdown =
    allowedUppercaseMarkdownFiles.has(fileName);

  if (/[A-Z]/.test(fileName) && !isAllowedUppercaseMarkdown) {
    problems.push(
      `Markdown files must use lowercase kebab-case unless explicitly allowed: ${rel}`,
    );
  }

  if (
    !isAllowedUppercaseMarkdown &&
    !/^(?:\d{3}-)?[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(fileName)
  ) {
    problems.push(
      `Markdown filename must be lowercase kebab-case, optionally prefixed with 00N-: ${rel}`,
    );
  }

  if (!rel.includes("/") && lowerFileName.endsWith("-architecture.md")) {
    problems.push(
      `Root-level architecture docs are not allowed; move ${rel} under docs/architecture/`,
    );
  }

  const isArchitectureDoc =
    lowerFileName.includes("architecture") || fileName === "ARCHITECTURE.md";
  const normalizedRel = rel.replace(/\\/g, "/");
  const isFeatureVerticalArchitectureDoc =
    /^packages\/features\/[^/]+\/src\/(?:[^/]+\/)+[^/]*architecture[^/]*\.md$/.test(
      normalizedRel,
    );
  const isKernelVerticalArchitectureDoc =
    /^packages\/kernel\/src\/[^/]+\/[^/]*architecture[^/]*\.md$/.test(
      normalizedRel,
    );
  const isKernelLegacyArchitectureRedirect =
    normalizedRel === "packages/kernel/kernel-architecture.md";
  if (
    isArchitectureDoc &&
    !rel.startsWith("docs/architecture/") &&
    !isFeatureVerticalArchitectureDoc &&
    !isKernelVerticalArchitectureDoc &&
    !isKernelLegacyArchitectureRedirect
  ) {
    problems.push(
      `Architecture docs must live under docs/architecture/ or a feature vertical bucket: ${rel}`,
    );
  }

  const isDraftOrRoadmapDoc =
    /(^|-)draft(-|\.md$)/.test(lowerFileName) ||
    /(^|-)roadmap(-|\.md$)/.test(lowerFileName);
  if (rel.startsWith("docs/architecture/") && isDraftOrRoadmapDoc) {
    problems.push(
      `Draft and roadmap docs must live under docs/roadmap/, not docs/architecture/: ${rel}`,
    );
  }
}

function checkArchitectureDocumentationLinks(filePath: string) {
  const rel = relativePath(filePath);
  if (!rel.startsWith("docs/architecture/") || !isMarkdownFile(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const staleReference of staleDocumentationReferences) {
    if (content.includes(staleReference)) {
      problems.push(
        `Architecture doc references moved path ${staleReference}: ${rel}`,
      );
    }
  }

  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(content))) {
    const target = match[1]?.trim();
    if (!target || isExternalMarkdownTarget(target)) {
      continue;
    }

    const targetPath = getMarkdownLinkTarget(target);
    if (!targetPath) {
      continue;
    }

    const resolvedTarget = path.resolve(path.dirname(filePath), targetPath);
    if (!fs.existsSync(resolvedTarget)) {
      problems.push(
        `Architecture doc has a broken relative link: ${rel} -> ${target}`,
      );
    }
  }
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDirectory(entry.name)) {
        continue;
      }

      walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (isGeneratedSourceFile(fullPath)) {
      problems.push(
        `Generated file inside source tree: ${relativePath(fullPath)}`,
      );
    }

    if (entry.name.endsWith(".tsbuildinfo")) {
      problems.push(
        `TypeScript build info outside approved cache: ${relativePath(fullPath)}`,
      );
    }

    checkDocumentationNaming(fullPath);
    checkArchitectureDocumentationLinks(fullPath);
  }
}

function checkRootHygiene() {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && disallowedRootDirectoryNames.has(entry.name)) {
      problems.push(
        `Disallowed root directory "${entry.name}/": collides with ".artifacts/" (test output). Move reports to docs/testing/ and remove from git.`,
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (disallowedRootFileNames.has(entry.name)) {
      problems.push(
        `Disallowed root file "${entry.name}": local debug output must not be committed. Delete and add to .gitignore; use .artifacts/logs/ if retention is needed.`,
      );
      continue;
    }

    if (
      disallowedRootFilePatterns.some((pattern) => pattern.test(entry.name))
    ) {
      problems.push(
        `Disallowed root snapshot file "${entry.name}": use .artifacts/playwright/ or docs/testing/, not the repo root.`,
      );
    }
  }
}

function checkAppUiBoundary() {
  const appUiDir = path.join(root, "apps/erp/src/components/ui");
  if (fs.existsSync(appUiDir)) {
    problems.push(
      "apps/erp/src/components/ui must not exist; shared UI primitives belong in packages/ui/src",
    );
  }

  const componentsConfigPath = path.join(root, "apps/erp/components.json");
  if (!fs.existsSync(componentsConfigPath)) {
    return;
  }

  const componentsConfig = readJson(componentsConfigPath);
  const aliases =
    componentsConfig.aliases &&
    typeof componentsConfig.aliases === "object" &&
    !Array.isArray(componentsConfig.aliases)
      ? (componentsConfig.aliases as Record<string, unknown>)
      : {};
  const uiAlias = aliases.ui;
  if (uiAlias !== "../../packages/ui/src") {
    problems.push(
      `apps/erp/components.json aliases.ui must target ../../packages/ui/src, found ${JSON.stringify(uiAlias)}`,
    );
  }
}

function readWorkspacePackages(workspaceRoot: WorkspaceRoot) {
  const workspaceDir = path.join(root, workspaceRoot);
  const packages: WorkspacePackage[] = [];

  function pushPackage(packageDirectory: string, directoryName: string) {
    const packageJsonPath = path.join(root, packageDirectory, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    packages.push({
      workspaceRoot,
      packageDirectory,
      directoryName,
      packageJsonPath,
      packageJson: readJson(packageJsonPath),
    });
  }

  for (const entry of fs.readdirSync(workspaceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDirectory = normalize(path.join(workspaceRoot, entry.name));
    pushPackage(packageDirectory, entry.name);

    if (workspaceRoot !== "packages" || entry.name !== "features") {
      continue;
    }

    const featuresDir = path.join(workspaceDir, entry.name);
    for (const featureEntry of fs.readdirSync(featuresDir, {
      withFileTypes: true,
    })) {
      if (!featureEntry.isDirectory()) {
        continue;
      }

      pushPackage(
        normalize(path.join(workspaceRoot, entry.name, featureEntry.name)),
        featureEntry.name,
      );
    }
  }

  return packages;
}

function getScripts(packageJson: Record<string, unknown>) {
  return packageJson.scripts &&
    typeof packageJson.scripts === "object" &&
    !Array.isArray(packageJson.scripts)
    ? (packageJson.scripts as Record<string, unknown>)
    : {};
}

function getExports(packageJson: Record<string, unknown>) {
  return packageJson.exports &&
    typeof packageJson.exports === "object" &&
    !Array.isArray(packageJson.exports)
    ? (packageJson.exports as Record<string, unknown>)
    : {};
}

function getPackageRule(
  packageName: string,
  workspacePackage: WorkspacePackage,
): PackageArchitectureRule | undefined {
  const staticRule = packageArchitectureRules[packageName];
  if (staticRule) {
    return staticRule;
  }

  if (
    workspacePackage.packageDirectory.startsWith("packages/features/") &&
    packageName.startsWith("@afenda/feature-")
  ) {
    return {
      category: "feature-package",
      workspaceRoot: "packages",
      requiresCompiledDistExports: true,
      requiresPackageBuild: true,
      turboBuildOutputs: ["dist/**"],
    };
  }

  return undefined;
}

function getPackageName(workspacePackage: WorkspacePackage) {
  const workspaceRoot = workspacePackage.workspaceRoot;
  const directoryName = workspacePackage.directoryName;
  const packageDirectory = workspacePackage.packageDirectory;
  const packageName = workspacePackage.packageJson.name;

  if (typeof packageName !== "string") {
    problems.push(`${packageDirectory} package.json needs a name`);
    return undefined;
  }

  const isFeaturePackage = packageDirectory.startsWith("packages/features/");
  const expectedDirectoryName = isFeaturePackage
    ? packageName.replace(/^@afenda\/feature-/, "")
    : packageName.replace(/^@afenda\//, "");
  const expectedPackageDirectory = isFeaturePackage
    ? `packages/features/${expectedDirectoryName}`
    : `${workspaceRoot}/${expectedDirectoryName}`;

  if (expectedDirectoryName !== directoryName) {
    problems.push(
      `${packageName} must live in ${expectedPackageDirectory}, found ${packageDirectory}`,
    );
  }

  return packageName;
}

function readAllWorkspacePackages() {
  return [
    ...readWorkspacePackages("apps"),
    ...readWorkspacePackages("packages"),
  ];
}

function readClassifiedWorkspacePackages() {
  return readAllWorkspacePackages()
    .map((workspacePackage): WorkspacePackageWithName | null => {
      const packageName = getPackageName(workspacePackage);
      if (!packageName) {
        return null;
      }

      const rule = getPackageRule(packageName, workspacePackage);
      if (!rule) {
        return null;
      }

      return { ...workspacePackage, packageName, rule };
    })
    .filter((workspacePackage): workspacePackage is WorkspacePackageWithName =>
      Boolean(workspacePackage),
    );
}

function checkWorkspacePackageRegistry() {
  const seenPackages = new Set<string>();

  for (const workspacePackage of readAllWorkspacePackages()) {
    const packageName = getPackageName(workspacePackage);
    if (!packageName) {
      continue;
    }

    seenPackages.add(packageName);

    const rule = getPackageRule(packageName, workspacePackage);
    if (!rule) {
      problems.push(
        `${packageName} is not classified in packageArchitectureRules and does not match an approved dynamic category`,
      );
      continue;
    }

    if (rule.workspaceRoot !== workspacePackage.workspaceRoot) {
      problems.push(
        `${packageName} is classified for ${rule.workspaceRoot}/ but lives in ${workspacePackage.workspaceRoot}/`,
      );
    }
  }

  for (const packageName of Object.keys(packageArchitectureRules)) {
    if (!seenPackages.has(packageName)) {
      problems.push(
        `${packageName} is classified in packageArchitectureRules but no matching workspace package exists`,
      );
    }
  }
}

function checkFeatureWorkspaceDiscipline() {
  const featuresRoot = path.join(root, "packages/features");
  if (!fs.existsSync(featuresRoot)) {
    return;
  }

  const requiredFeatureExports = [".", "./client", "./server", "./metadata"];

  for (const workspacePackage of readWorkspacePackages("packages")) {
    if (!workspacePackage.packageDirectory.startsWith("packages/features/")) {
      continue;
    }

    const packageName = getPackageName(workspacePackage);
    if (!packageName) {
      continue;
    }

    const expectedName = `@afenda/feature-${workspacePackage.directoryName}`;
    if (packageName !== expectedName) {
      problems.push(
        `${workspacePackage.packageDirectory} package name must be ${expectedName}, found ${packageName}`,
      );
    }

    const exportEntries = getExports(workspacePackage.packageJson);
    for (const requiredExport of requiredFeatureExports) {
      if (!(requiredExport in exportEntries)) {
        problems.push(
          `${packageName} must expose ${requiredExport} public export door`,
        );
      }
    }
  }

  function walkFeatureDir(dir: string, depthFromFeaturesRoot: number) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (isIgnoredDirectory(entry.name)) {
        continue;
      }

      const entryPath = path.join(dir, entry.name);
      const packageJsonPath = path.join(entryPath, "package.json");
      if (depthFromFeaturesRoot >= 1 && fs.existsSync(packageJsonPath)) {
        const rel = relativePath(packageJsonPath);
        if (!/^packages\/features\/[^/]+\/package\.json$/.test(rel)) {
          problems.push(
            `Nested feature workspaces are not allowed by default: ${rel}`,
          );
        }
      }

      walkFeatureDir(entryPath, depthFromFeaturesRoot + 1);
    }
  }

  walkFeatureDir(featuresRoot, 0);
}

function checkFeatureBucketGrammar() {
  const featuresRoot = path.join(root, "packages/features");
  if (!fs.existsSync(featuresRoot)) {
    return;
  }

  const templateBuckets = readTemplateBuckets(root);
  const templateBucketSet = new Set<string>(templateBuckets);

  for (const featureEntry of fs.readdirSync(featuresRoot, {
    withFileTypes: true,
  })) {
    if (!featureEntry.isDirectory()) {
      continue;
    }

    const featureDir = path.join(featuresRoot, featureEntry.name);
    const { baseDir, legacy } = resolveFeatureBaseDir(featureDir);
    if (!fs.existsSync(baseDir)) {
      continue;
    }

    const topEntries = fs.readdirSync(baseDir, { withFileTypes: true });
    const topNames = new Set(topEntries.map((entry) => entry.name));

    if (!legacy) {
      for (const door of featurePublicDoorFiles) {
        if (!topNames.has(door)) {
          problems.push(
            `Feature ${featureEntry.name} must include public door ${door} (see packages/_template-definition)`,
          );
        }
      }

      const presentTemplateBuckets = templateBuckets.filter((bucket) =>
        topNames.has(bucket),
      );
      if (presentTemplateBuckets.length === 0) {
        problems.push(
          `Feature ${featureEntry.name} must include at least one template bucket (see packages/_template-definition)`,
        );
      }
    }

    for (const topEntry of topEntries) {
      const rel = relativePath(path.join(baseDir, topEntry.name));

      if (bannedBucketNames.has(topEntry.name)) {
        if (
          !(featureEntry.name === "system-admin" && topEntry.name === "lib")
        ) {
          problems.push(
            `Feature uses banned folder name "${topEntry.name}": ${rel}`,
          );
        }
      }

      if (topEntry.isFile() || !topEntry.isDirectory()) {
        continue;
      }

      if (templateBucketSet.has(topEntry.name)) {
        continue;
      }

      if (legacy) {
        continue;
      }

      const featurePackageInternalDirs = new Set([
        "src",
        "dist",
        "tests",
        "docs",
        "scripts",
      ]);
      if (featurePackageInternalDirs.has(topEntry.name)) {
        continue;
      }

      const verticalDir = path.join(baseDir, topEntry.name);
      const verticalEntries = fs
        .readdirSync(verticalDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      const hasAnyTemplateBucket = templateBuckets.some((bucket) =>
        verticalEntries.includes(bucket),
      );
      if (!hasAnyTemplateBucket) {
        continue;
      }

      for (const bucket of templateBuckets) {
        if (!verticalEntries.includes(bucket)) {
          problems.push(
            `Vertical ${featureEntry.name}/${topEntry.name} must contain template bucket "${bucket}"`,
          );
        }
      }

      for (const verticalEntry of verticalEntries) {
        if (bannedBucketNames.has(verticalEntry)) {
          problems.push(
            `Vertical ${featureEntry.name}/${topEntry.name} uses banned folder "${verticalEntry}"`,
          );
        }
      }
    }
  }

  walkSourceFiles(featuresRoot, (filePath) => {
    const rel = relativePath(filePath);
    const parsed = parseFeaturePath(rel);
    if (!parsed || !parsed.afterBase) {
      return;
    }

    const fileName = path.basename(rel);
    if (fileName.endsWith(".client.ts") || fileName.endsWith(".client.tsx")) {
      if (!rel.includes("/components/")) {
        problems.push(`Client-suffix file must live in components/: ${rel}`);
      }
    }

    if (fileName.endsWith(".actions.server.ts") && !rel.includes("/actions/")) {
      problems.push(`Action server file must live in actions/: ${rel}`);
    }
  });
}

function checkAppRouteFileWhitelist() {
  const appRoot = path.join(root, "apps/erp/src");
  if (!fs.existsSync(appRoot)) {
    return;
  }

  const transitionAllowList = new Set([
    "apps/erp/src/app/app-analytics.tsx",
    "apps/erp/src/app/onboarding/onboarding-form.tsx",
    "apps/erp/src/app/interface-lab/primitives/dialog-open-fixture.client.tsx",
  ]);

  walkSourceFiles(appRoot, (filePath) => {
    const rel = relativePath(filePath);

    if (!rel.startsWith("apps/erp/src/app/")) {
      return;
    }

    if (rel.endsWith(".tsx")) {
      const fileName = path.basename(rel);
      const inPrivateComponents = rel.includes("/_components/");
      if (
        !appRouteAllowedTsxNames.has(fileName) &&
        fileName !== "global-error.tsx" &&
        !inPrivateComponents &&
        !transitionAllowList.has(rel)
      ) {
        problems.push(`Non-route TSX file found in app tree: ${rel}`);
      }
    }
  });
}

function readTranspilePackages() {
  const nextConfigPath = path.join(root, "packages/config/src/next.ts");
  if (!fs.existsSync(nextConfigPath)) {
    problems.push("packages/config/src/next.ts is required");
    return new Set<string>();
  }

  const content = fs.readFileSync(nextConfigPath, "utf8");
  const arrayMatch = content.match(
    /afendaTranspilePackages\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );
  if (!arrayMatch?.[1]) {
    problems.push(
      "packages/config/src/next.ts must export afendaTranspilePackages as a const string array",
    );
    return new Set<string>();
  }

  const packageNames = new Set<string>();
  const stringPattern = /"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = stringPattern.exec(arrayMatch[1]))) {
    if (match[1]) {
      packageNames.add(match[1]);
    }
  }

  return packageNames;
}

function getDependencies(packageJson: Record<string, unknown>) {
  const dependencyNames = new Set<string>();

  for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
    const dependencies = packageJson[field];
    if (
      !dependencies ||
      typeof dependencies !== "object" ||
      Array.isArray(dependencies)
    ) {
      continue;
    }

    for (const dependencyName of Object.keys(dependencies)) {
      dependencyNames.add(dependencyName);
    }
  }

  return dependencyNames;
}

function checkAppWorkspaceDependencySync() {
  const appPackagePath = path.join(root, "apps/erp/package.json");
  if (!fs.existsSync(appPackagePath)) {
    problems.push("apps/erp/package.json is required");
    return;
  }

  const appPackageJson = readJson(appPackagePath);
  const appDependencies = getDependencies(appPackageJson);
  const transpilePackages = readTranspilePackages();

  for (const { packageName, rule } of readClassifiedWorkspacePackages()) {
    if (packageName === "@afenda/erp") {
      continue;
    }

    if (!appDependencies.has(packageName)) {
      continue;
    }

    if (rule.category === "next-app") {
      continue;
    }

    if (!transpilePackages.has(packageName)) {
      problems.push(
        `${packageName} is an apps/erp workspace dependency but is missing from afendaTranspilePackages`,
      );
    }
  }

  for (const packageName of transpilePackages) {
    if (!packageName.startsWith("@afenda/")) {
      continue;
    }

    if (!appDependencies.has(packageName)) {
      problems.push(
        `${packageName} is listed in afendaTranspilePackages but is not an apps/erp dependency`,
      );
    }
  }
}

function getImportSpecifiers(content: string) {
  const specifiers: string[] = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[^'"]+\s+from\s+["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content))) {
      if (match[1]) {
        specifiers.push(match[1]);
      }
    }
  }

  return specifiers;
}

function walkSourceFiles(dir: string, visit: (filePath: string) => void) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!isIgnoredDirectory(entry.name)) {
        walkSourceFiles(fullPath, visit);
      }
      continue;
    }

    if (entry.isFile() && isSourceFile(fullPath)) {
      visit(fullPath);
    }
  }
}

function checkImportBoundaries() {
  const packagesRoot = path.join(root, "packages");
  walkSourceFiles(packagesRoot, (filePath) => {
    const rel = relativePath(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const importSpecifiers = getImportSpecifiers(content);
    const isFeaturePackageFile = rel.startsWith("packages/features/");
    const isClientEntry =
      isFeaturePackageFile &&
      (rel.endsWith("/src/client.ts") ||
        rel.endsWith("/src/client.tsx") ||
        rel.includes("/src/client/") ||
        rel.endsWith(".client.ts") ||
        rel.endsWith(".client.tsx"));

    for (const specifier of importSpecifiers) {
      if (
        specifier.startsWith("@afenda/feature-") &&
        /\/(?:src|dist|internal)(?:\/|$)/.test(specifier)
      ) {
        problems.push(
          `${rel} imports a feature package internal path; use public export doors: ${specifier}`,
        );
      }

      if (
        specifier.startsWith("@afenda/feature-") &&
        !isFeaturePackageFile &&
        !rel.startsWith("packages/kernel/")
      ) {
        const packageRoot = specifier.split("/").slice(0, 2).join("/");
        if (
          packageRoot !== specifier &&
          !/^@afenda\/feature-[^/]+\/(?:client|server|metadata)$/.test(
            specifier,
          )
        ) {
          problems.push(
            `${rel} must import feature packages through ., ./client, ./server, or ./metadata: ${specifier}`,
          );
        }
      }

      if (specifier.includes("apps/erp") || specifier.startsWith("../apps/")) {
        problems.push(
          `${rel} must not import from apps/erp; app code depends on packages, not the other way around`,
        );
      }

      if (
        isClientEntry &&
        (specifier === "@afenda/db" ||
          specifier.startsWith("@afenda/db/") ||
          specifier === "@afenda/ai" ||
          specifier.startsWith("@afenda/ai/") ||
          specifier === "@afenda/workflows" ||
          specifier.startsWith("@afenda/workflows/") ||
          specifier === "@afenda/auth/server" ||
          specifier.startsWith("@afenda/auth/server/") ||
          specifier.startsWith("node:"))
      ) {
        problems.push(
          `${rel} is a client export path and must not import server-only module ${specifier}`,
        );
      }
    }
  });
}

function checkFeatureServerBoundaryMarkers() {
  const featuresRoot = path.join(root, "packages/features");
  if (!fs.existsSync(featuresRoot)) {
    return;
  }

  walkSourceFiles(featuresRoot, (filePath) => {
    const rel = relativePath(filePath);
    if (/\/scripts\//.test(rel.replace(/\\/g, "/"))) {
      return;
    }
    const content = fs.readFileSync(filePath, "utf8");
    const importSpecifiers = getImportSpecifiers(content);
    const isFeatureServerDoor =
      /^packages\/features\/[^/]+\/src\/server\.tsx?$/.test(rel);

    for (const specifier of importSpecifiers) {
      if (specifier === "server-only" || specifier === "server-only/index.js") {
        problems.push(
          `${rel} must not import server-only directly; mark the feature package server boundary through @afenda/kernel/server in src/server.ts`,
        );
      }

      if (specifier === "@afenda/kernel/server" && !isFeatureServerDoor) {
        problems.push(
          `${rel} must not import @afenda/kernel/server directly; feature internals inherit the server boundary from src/server.ts`,
        );
      }
    }

    if (
      isFeatureServerDoor &&
      !importSpecifiers.includes("@afenda/kernel/server")
    ) {
      problems.push(
        `${rel} must import @afenda/kernel/server as the feature package server boundary marker`,
      );
    }
  });
}

function checkFeatureSchemaOwnership() {
  const featuresRoot = path.join(root, "packages/features");
  if (!fs.existsSync(featuresRoot)) {
    return;
  }

  walkSourceFiles(featuresRoot, (filePath) => {
    const rel = relativePath(filePath);
    const content = fs.readFileSync(filePath, "utf8");

    if (
      content.includes("pgTable(") ||
      content.includes("pgEnum(")
    ) {
      problems.push(
        `Feature package must not own Drizzle DDL; move schema to @afenda/db: ${rel}`,
      );
    }

    if (content.includes('"use server"') || content.includes("'use server'")) {
      const isActionPath =
        rel.includes("/actions/") ||
        rel.includes("/actions.server.") ||
        rel.includes("actions.server.ts");
      if (!isActionPath) {
        problems.push(
          `'use server' is only allowed in action-oriented files: ${rel}`,
        );
      }
    }
  });
}

function checkPackageBuildPolicy() {
  for (const workspacePackage of readWorkspacePackages("packages")) {
    const packageName = getPackageName(workspacePackage);
    if (!packageName) {
      continue;
    }

    const rule = getPackageRule(packageName, workspacePackage);
    if (!rule?.requiresPackageBuild) {
      continue;
    }

    const scripts = getScripts(workspacePackage.packageJson);
    const buildScript = scripts.build;
    if (buildScript !== "tsc -p tsconfig.build.json") {
      problems.push(
        `${packageName} build script must emit compiled output with "tsc -p tsconfig.build.json"`,
      );
    }

    const tsconfigBuildPath = path.join(
      root,
      workspacePackage.packageDirectory,
      "tsconfig.build.json",
    );
    if (!fs.existsSync(tsconfigBuildPath)) {
      problems.push(
        `${packageName} has a build script but no tsconfig.build.json`,
      );
      continue;
    }

    const tsconfigBuild = readJson(tsconfigBuildPath);
    const buildExtends = tsconfigBuild.extends;
    if (
      typeof buildExtends !== "string" ||
      !(
        buildExtends.includes("tsconfig.build.base.json") ||
        buildExtends.includes("tsconfig.build.library.base.json") ||
        buildExtends.includes("tsconfig.build.react.base.json")
      )
    ) {
      problems.push(
        `${packageName} tsconfig.build.json must extend a packages/config/tsconfig.build.*.base.json profile`,
      );
    }

    const tsconfigPath = path.join(
      root,
      workspacePackage.packageDirectory,
      "tsconfig.json",
    );
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = readJson(tsconfigPath);
      const typecheckExtends = tsconfig.extends;
      if (
        typeof typecheckExtends === "string" &&
        !(
          typecheckExtends.includes("tsconfig.check.base.json") ||
          typecheckExtends.includes("tsconfig.library.base.json") ||
          typecheckExtends.includes("tsconfig.feature.base.json") ||
          typecheckExtends.includes("tsconfig.next.base.json") ||
          typecheckExtends.includes("tsconfig.test.base.json")
        )
      ) {
        problems.push(
          `${packageName} tsconfig.json must extend a packages/config/tsconfig.*.base.json typecheck profile`,
        );
      }
    }

    if (!rule.requiresCompiledDistExports) {
      continue;
    }

    const exportEntries = getExports(workspacePackage.packageJson);
    for (const [exportName, exportValue] of Object.entries(exportEntries)) {
      if (
        !exportValue ||
        typeof exportValue !== "object" ||
        Array.isArray(exportValue) ||
        !("default" in exportValue)
      ) {
        continue;
      }

      const defaultExport = (exportValue as { default?: unknown }).default;
      if (typeof defaultExport !== "string") {
        problems.push(
          `${packageName} ${exportName} default export must be a string`,
        );
        continue;
      }

      if (
        !defaultExport.startsWith("./dist/") ||
        !defaultExport.endsWith(".js")
      ) {
        problems.push(
          `${packageName} ${exportName} default export must point to compiled dist JS, found ${defaultExport}`,
        );
      }
    }
  }
}

function checkTurboBuildOutputs() {
  const turboConfigPath = path.join(root, "turbo.json");
  if (!fs.existsSync(turboConfigPath)) {
    problems.push("turbo.json is required for workspace build orchestration");
    return;
  }

  const turboConfig = readJson(turboConfigPath);
  const tasks =
    turboConfig.tasks &&
    typeof turboConfig.tasks === "object" &&
    !Array.isArray(turboConfig.tasks)
      ? (turboConfig.tasks as Record<string, unknown>)
      : {};

  const defaultBuildTask = tasks.build;
  const defaultBuildOutputs =
    defaultBuildTask &&
    typeof defaultBuildTask === "object" &&
    !Array.isArray(defaultBuildTask) &&
    Array.isArray((defaultBuildTask as Record<string, unknown>).outputs)
      ? ((defaultBuildTask as Record<string, unknown>).outputs as unknown[])
      : [];

  const packagesWithRules = readAllWorkspacePackages()
    .map((workspacePackage) => {
      const packageName = getPackageName(workspacePackage);
      if (!packageName) {
        return null;
      }

      const rule = getPackageRule(packageName, workspacePackage);
      return rule ? { packageName, rule } : null;
    })
    .filter(
      (
        entry,
      ): entry is { packageName: string; rule: PackageArchitectureRule } =>
        Boolean(entry),
    );

  for (const { packageName, rule } of packagesWithRules) {
    if (!rule.requiresPackageBuild && rule.turboBuildOutputs.length === 0) {
      continue;
    }

    const taskName = `${packageName}#build`;
    const task = tasks[taskName];
    if (!task || typeof task !== "object" || Array.isArray(task)) {
      const missingOutputs = rule.turboBuildOutputs.filter(
        (expectedOutput) => !defaultBuildOutputs.includes(expectedOutput),
      );

      if (missingOutputs.length === 0) {
        continue;
      }

      problems.push(`${taskName} must be declared in turbo.json`);
      continue;
    }

    const outputs = (task as Record<string, unknown>).outputs;
    if (!Array.isArray(outputs)) {
      problems.push(`${taskName} must declare Turborepo outputs`);
      continue;
    }

    const missingOutputs = rule.turboBuildOutputs.filter(
      (expectedOutput) => !outputs.includes(expectedOutput),
    );
    if (missingOutputs.length > 0) {
      problems.push(
        `${taskName} outputs must include ${missingOutputs.join(", ")}`,
      );
    }
  }
}

function typecheckProfileIncludesVitestSources(tsconfigPath: string): boolean {
  const visited = new Set<string>();
  let currentPath = tsconfigPath;

  while (!visited.has(currentPath)) {
    visited.add(currentPath);
    const tsconfig = readJson(currentPath);
    const include = Array.isArray(tsconfig.include) ? tsconfig.include : [];
    if (
      include.some(
        (pattern: unknown) =>
          typeof pattern === "string" &&
          (pattern.includes("tests/") || pattern.includes("*.test.")),
      )
    ) {
      return true;
    }

    const extendsValue = tsconfig.extends;
    if (typeof extendsValue !== "string") {
      break;
    }

    currentPath = path.resolve(path.dirname(currentPath), extendsValue);
  }

  return false;
}

function checkTypecheckIncludesVitestSources() {
  for (const workspaceRoot of ["packages", "apps"] as const) {
    for (const workspacePackage of readWorkspacePackages(workspaceRoot)) {
      const vitestConfigPath = path.join(
        root,
        workspacePackage.packageDirectory,
        "vitest.config.ts",
      );
      if (!fs.existsSync(vitestConfigPath)) {
        continue;
      }

      const packageName =
        getPackageName(workspacePackage) ?? workspacePackage.packageDirectory;
      const tsconfigPath = path.join(
        root,
        workspacePackage.packageDirectory,
        "tsconfig.json",
      );
      if (!fs.existsSync(tsconfigPath)) {
        problems.push(
          `${packageName} has vitest.config.ts but no tsconfig.json`,
        );
        continue;
      }

      const includesTestsInPrimary =
        typecheckProfileIncludesVitestSources(tsconfigPath);

      const tsconfigTestPath = path.join(
        root,
        workspacePackage.packageDirectory,
        "tsconfig.test.json",
      );
      const hasDedicatedTestProject = fs.existsSync(tsconfigTestPath);

      if (!includesTestsInPrimary && !hasDedicatedTestProject) {
        problems.push(
          `${packageName} must typecheck Vitest sources via tsconfig.json (tests/**) or tsconfig.test.json`,
        );
      }
    }
  }
}

walk(root);
checkRootHygiene();
checkAppUiBoundary();
checkWorkspacePackageRegistry();
checkFeatureWorkspaceDiscipline();
checkFeatureBucketGrammar();
checkPackageBuildPolicy();
checkTypecheckIncludesVitestSources();
checkTurboBuildOutputs();
checkAppWorkspaceDependencySync();
checkImportBoundaries();
checkFeatureServerBoundaryMarkers();
checkFeatureSchemaOwnership();
checkAppRouteFileWhitelist();

if (problems.length > 0) {
  console.error("[architecture:check] Directory architecture violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("[architecture:check] directory architecture boundaries are valid");
