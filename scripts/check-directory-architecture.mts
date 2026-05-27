import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems: string[] = [];

type WorkspaceRoot = "apps" | "packages";
type PackageCategory =
  | "next-app"
  | "runtime-library"
  | "ui-primitives"
  | "config"
  | "database";

type PackageArchitectureRule = {
  category: PackageCategory;
  workspaceRoot: WorkspaceRoot;
  requiresCompiledDistExports: boolean;
  requiresPackageBuild: boolean;
  turboBuildOutputs: string[];
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
  "@afenda/auth": {
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
  "@afenda/domain": {
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
  "dist",
  ".codex-runtime",
  ".codex-logs",
]);

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
    !/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(fileName)
  ) {
    problems.push(`Markdown filename must be lowercase kebab-case: ${rel}`);
  }

  if (!rel.includes("/") && lowerFileName.endsWith("-architecture.md")) {
    problems.push(
      `Root-level architecture docs are not allowed; move ${rel} under docs/architecture/`,
    );
  }

  const isArchitectureDoc =
    lowerFileName.includes("architecture") || fileName === "ARCHITECTURE.md";
  if (isArchitectureDoc && !rel.startsWith("docs/architecture/")) {
    problems.push(
      `Architecture docs must live under docs/architecture/: ${rel}`,
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
  const packages: Array<{
    directoryName: string;
    packageJsonPath: string;
    packageJson: Record<string, unknown>;
  }> = [];

  for (const entry of fs.readdirSync(workspaceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(workspaceDir, entry.name, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    packages.push({
      directoryName: entry.name,
      packageJsonPath,
      packageJson: readJson(packageJsonPath),
    });
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

function getPackageName(
  workspaceRoot: WorkspaceRoot,
  directoryName: string,
  packageJson: Record<string, unknown>,
) {
  const packageName = packageJson.name;
  if (typeof packageName !== "string") {
    problems.push(
      `${workspaceRoot}/${directoryName} package.json needs a name`,
    );
    return undefined;
  }

  const expectedDirectoryName = packageName.replace(/^@afenda\//, "");
  if (expectedDirectoryName !== directoryName) {
    problems.push(
      `${packageName} must live in ${workspaceRoot}/${expectedDirectoryName}, found ${workspaceRoot}/${directoryName}`,
    );
  }

  return packageName;
}

function checkWorkspacePackageRegistry() {
  const seenPackages = new Set<string>();

  for (const workspaceRoot of ["apps", "packages"] satisfies WorkspaceRoot[]) {
    for (const workspacePackage of readWorkspacePackages(workspaceRoot)) {
      const packageName = getPackageName(
        workspaceRoot,
        workspacePackage.directoryName,
        workspacePackage.packageJson,
      );
      if (!packageName) {
        continue;
      }

      seenPackages.add(packageName);

      const rule = packageArchitectureRules[packageName];
      if (!rule) {
        problems.push(
          `${packageName} is not classified in packageArchitectureRules; add a category before introducing a new workspace package`,
        );
        continue;
      }

      if (rule.workspaceRoot !== workspaceRoot) {
        problems.push(
          `${packageName} is classified for ${rule.workspaceRoot}/ but lives in ${workspaceRoot}/`,
        );
      }
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

function checkPackageBuildPolicy() {
  for (const workspacePackage of readWorkspacePackages("packages")) {
    const packageName = getPackageName(
      "packages",
      workspacePackage.directoryName,
      workspacePackage.packageJson,
    );
    if (!packageName) {
      continue;
    }

    const rule = packageArchitectureRules[packageName];
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
      "packages",
      workspacePackage.directoryName,
      "tsconfig.build.json",
    );
    if (!fs.existsSync(tsconfigBuildPath)) {
      problems.push(
        `${packageName} has a build script but no tsconfig.build.json`,
      );
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

  for (const [packageName, rule] of Object.entries(packageArchitectureRules)) {
    if (!rule.requiresPackageBuild && rule.turboBuildOutputs.length === 0) {
      continue;
    }

    const taskName = `${packageName}#build`;
    const task = tasks[taskName];
    if (!task || typeof task !== "object" || Array.isArray(task)) {
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

walk(root);
checkAppUiBoundary();
checkWorkspacePackageRegistry();
checkPackageBuildPolicy();
checkTurboBuildOutputs();

if (problems.length > 0) {
  console.error("[architecture:check] Directory architecture violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("[architecture:check] directory architecture boundaries are valid");
