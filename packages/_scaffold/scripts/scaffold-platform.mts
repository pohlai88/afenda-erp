import fs from "node:fs";
import path from "node:path";
import {
  applyTemplateTokens,
  getPlatformTemplateDir,
  getRepositoryRoot,
  platformCategories,
  type PlatformCategory,
  scaffoldRootRelativePath,
} from "./lib/scaffold-grammar.mts";
import {
  copyTreeIfMissing,
  ensureDir,
  writeFileAlways,
} from "./lib/scaffold-io.mts";

const root = getRepositoryRoot();

function parseCategory(): PlatformCategory {
  const flagIndex = process.argv.indexOf("--category");
  const raw = flagIndex >= 0 ? process.argv[flagIndex + 1]?.trim() : "runtime-library";
  if (!raw || !(platformCategories as readonly string[]).includes(raw)) {
    throw new Error(
      `Invalid --category. Allowed: ${platformCategories.join(", ")}`,
    );
  }
  return raw as PlatformCategory;
}

function scaffoldFromTemplate(
  templateCategoryDir: string,
  packageDir: string,
  tokens: Record<string, string>,
) {
  const templateSrcDir = path.join(templateCategoryDir, "src");
  const packageSrcDir = path.join(packageDir, "src");
  copyTreeIfMissing(templateSrcDir, packageSrcDir);

  const templateFiles = [
    "package.json.template",
    "tsconfig.json.template",
    "tsconfig.build.json.template",
    "vitest.config.ts.template",
    "AGENTS.md.template",
  ] as const;

  for (const templateFile of templateFiles) {
    const sourcePath = path.join(templateCategoryDir, templateFile);
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    const targetName = templateFile.replace(".template", "");
    writeFileAlways(
      path.join(packageDir, targetName),
      applyTemplateTokens(fs.readFileSync(sourcePath, "utf8"), tokens),
    );
  }
}

function main() {
  const packageName = process.argv[2]?.trim();
  const category = parseCategory();

  if (!packageName) {
    throw new Error(
      "Usage: pnpm scaffold:platform <package-slug> [--category runtime-library|ui-primitives]\nExample: pnpm scaffold:platform telemetry",
    );
  }

  if (!/^[a-z0-9-]+$/.test(packageName)) {
    throw new Error(`Package slug must be lowercase kebab-case. Received: ${packageName}`);
  }

  if (packageName.startsWith("feature-")) {
    throw new Error(
      "ERP modules use pnpm scaffold:feature <module-id> under packages/features/, not scaffold:platform.",
    );
  }

  const packageDir = path.join(root, "packages", packageName);
  if (fs.existsSync(packageDir)) {
    throw new Error(`Package directory already exists: packages/${packageName}`);
  }

  const tokens = {
    PACKAGE_NAME: packageName,
  };

  const templateCategoryDir = path.join(getPlatformTemplateDir(root), category);
  if (!fs.existsSync(templateCategoryDir)) {
    throw new Error(`Missing platform template: ${scaffoldRootRelativePath}/platform/${category}`);
  }

  ensureDir(packageDir);
  scaffoldFromTemplate(templateCategoryDir, packageDir, tokens);

  console.log(
    `[scaffold:platform] @afenda/${packageName} ready (${category} · ${scaffoldRootRelativePath}/platform/${category})`,
  );
  console.log(
    "[scaffold:platform] Post-steps: check-directory-architecture.mts · afendaTranspilePackages · pnpm architecture:check",
  );
}

main();
