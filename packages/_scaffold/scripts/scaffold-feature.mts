import fs from "node:fs";
import path from "node:path";
import {
  applyTemplateTokens,
  featurePublicDoorFiles,
  getFeatureTemplateDir,
  getFeatureTemplateSrcDir,
  getRepositoryRoot,
  readFeatureTemplateBuckets,
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
  featureSrcDir: string,
  tokens: Record<string, string>,
) {
  const sourcePath = path.join(featureTemplateSrcDir, doorFile);
  const targetPath = path.join(featureSrcDir, doorFile);

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

function copyTemplateBucket(bucket: string, featureSrcDir: string) {
  const sourcePath = path.join(featureTemplateSrcDir, bucket);
  const targetPath = path.join(featureSrcDir, bucket);
  if (!copyTreeIfMissing(sourcePath, targetPath)) {
    ensureDir(targetPath);
    writeIfMissing(
      path.join(targetPath, "index.ts"),
      `/** @afenda-bucket ${bucket} */\nexport {};\n`,
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

  const tokens = {
    MODULE_ID: moduleId,
    PACKAGE_NAME: `feature-${moduleId}`,
  };

  const featureDir = path.join(root, "packages/features", moduleId);
  const featureSrcDir = path.join(featureDir, "src");

  if (fs.existsSync(featureDir) && fs.existsSync(path.join(featureDir, "package.json"))) {
    console.log(
      `[scaffold:feature] ${moduleId} exists — filling missing doors and buckets only`,
    );
  } else {
    ensureDir(featureSrcDir);
    scaffoldPackageFiles(featureDir, tokens);
  }

  ensureDir(featureSrcDir);

  for (const door of featurePublicDoorFiles) {
    copyTemplateDoor(door, featureSrcDir, tokens);
  }

  for (const bucket of readFeatureTemplateBuckets(root)) {
    copyTemplateBucket(bucket, featureSrcDir);
  }

  console.log(
    `[scaffold:feature] @afenda/feature-${moduleId} ready (${readFeatureTemplateBuckets(root).length} buckets · template ${scaffoldRootRelativePath}/feature)`,
  );
  console.log(
    "[scaffold:feature] Post-steps: module-ids.ts · afendaTranspilePackages · apps/erp/package.json · pnpm architecture:check",
  );
}

main();
