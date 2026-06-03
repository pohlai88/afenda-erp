import fs from "node:fs";
import path from "node:path";
import {
  applyTemplateTokens,
  featurePackageCode,
  featurePublicDoorFiles,
  getFeatureTemplateDir,
  getFeatureTemplateSrcDir,
  getRepositoryRoot,
  isFeatureFlatFileName,
  isLegacyFeatureFolder,
  listFeatureFlatTemplateFiles,
  scaffoldRootRelativePath,
} from "./lib/scaffold-grammar.mts";
import {
  copyTreeIfMissing,
  ensureDir,
  writeFileAlways,
  writeIfMissing,
} from "./lib/scaffold-io.mts";

const root = getRepositoryRoot();
const featureTemplateDir = getFeatureTemplateDir(root);
const featureTemplateSrcDir = getFeatureTemplateSrcDir(root);

function copyTemplateDoor(
  doorFile: string,
  targetSrcDir: string,
  tokens: Record<string, string>,
) {
  const sourcePath = path.join(featureTemplateSrcDir, doorFile);
  const targetPath = path.join(targetSrcDir, doorFile);

  if (fs.existsSync(sourcePath)) {
    writeIfMissing(
      targetPath,
      applyTemplateTokens(fs.readFileSync(sourcePath, "utf8"), tokens),
    );
    return;
  }

  writeIfMissing(
    targetPath,
    applyTemplateTokens(
      `/** Public door — scaffolded from ${scaffoldRootRelativePath}/feature */\nexport {};\n`,
      tokens,
    ),
  );
}

function copyFlatTemplateFiles(targetSrcDir: string, tokens: Record<string, string>) {
  for (const templateFile of listFeatureFlatTemplateFiles(root)) {
    if (featurePublicDoorFiles.includes(templateFile as (typeof featurePublicDoorFiles)[number])) {
      continue;
    }

    const sourcePath = path.join(featureTemplateSrcDir, templateFile);
    const targetName = applyTemplateTokens(templateFile, tokens);
    const targetPath = path.join(targetSrcDir, targetName);

    writeIfMissing(
      targetPath,
      applyTemplateTokens(fs.readFileSync(sourcePath, "utf8"), tokens),
    );
  }
}

function scaffoldPackageFiles(featureDir: string, tokens: Record<string, string>) {
  const templateFiles = [
    "package.json.template",
    "tsconfig.json.template",
    "tsconfig.build.json.template",
    "vitest.config.ts.template",
    "AGENTS.md.template",
  ] as const;

  for (const templateFile of templateFiles) {
    const sourcePath = path.join(featureTemplateDir, templateFile);
    const targetName = templateFile.replace(".template", "");
    const targetPath = path.join(featureDir, targetName);
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    if (targetName === "package.json" && fs.existsSync(targetPath)) {
      continue;
    }
    writeFileAlways(
      targetPath,
      applyTemplateTokens(fs.readFileSync(sourcePath, "utf8"), tokens),
    );
  }
}

function assertFlatTargetDir(targetSrcDir: string) {
  if (!fs.existsSync(targetSrcDir)) return;

  for (const entry of fs.readdirSync(targetSrcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      throw new Error(
        `Flat feature src must not contain subfolders at ${targetSrcDir}. Found "${entry.name}/". Use pnpm scaffold:vertical for capability folders.`,
      );
    }
    if (entry.isFile() && !isFeatureFlatFileName(entry.name)) {
      throw new Error(
        `Existing file "${entry.name}" does not match flat naming. Rename to {code}-{topic}.{artifact}.{canonical}.{ext} before scaffolding.`,
      );
    }
  }
}

function main() {
  const moduleId = process.argv[2]?.trim();

  if (!moduleId) {
    throw new Error(
      "Usage: pnpm scaffold:feature <module-id>\nExample: pnpm scaffold:feature purchasing",
    );
  }

  if (!/^[a-z0-9-]+$/.test(moduleId)) {
    throw new Error(`Module id must be lowercase kebab-case. Received: ${moduleId}`);
  }

  const code = featurePackageCode(moduleId);
  const tokens = {
    MODULE_ID: moduleId,
    PACKAGE_NAME: `feature-${moduleId}`,
    CODE: code,
  };

  const featureDir = path.join(root, "packages/features", moduleId);
  const featureSrcDir = path.join(featureDir, "src");

  if (fs.existsSync(featureDir) && fs.existsSync(path.join(featureDir, "package.json"))) {
    console.log(
      `[scaffold:feature] ${moduleId} exists — filling missing doors and flat files only`,
    );
  } else {
    ensureDir(featureSrcDir);
    scaffoldPackageFiles(featureDir, tokens);
  }

  ensureDir(featureSrcDir);

  const hasLegacyLayout = fs.existsSync(featureSrcDir)
    ? fs.readdirSync(featureSrcDir, { withFileTypes: true }).some(
        (entry) => entry.isDirectory() && isLegacyFeatureFolder(entry.name),
      )
    : false;

  if (!hasLegacyLayout) {
    assertFlatTargetDir(featureSrcDir);
  }

  for (const door of featurePublicDoorFiles) {
    copyTemplateDoor(door, featureSrcDir, tokens);
  }

  copyFlatTemplateFiles(featureSrcDir, tokens);

  console.log(
    `[scaffold:feature] @afenda/feature-${moduleId} ready (flat src · code=${code} · template ${scaffoldRootRelativePath}/feature)`,
  );
  console.log(
    "[scaffold:feature] Post-steps: module-ids.ts · afendaTranspilePackages · apps/erp/package.json · pnpm architecture:check",
  );
}

main();
