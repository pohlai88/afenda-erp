import fs from "node:fs";
import path from "node:path";
import {
  applyTemplateTokens,
  createFlatFeaturePlaceholder,
  featureFlatFileViolation,
  featurePackageCode,
  featurePublicDoorFiles,
  getFeatureTemplateSrcDir,
  getRepositoryRoot,
  isLegacyFeatureFolder,
  listFeatureFlatTemplateFiles,
  scaffoldRootRelativePath,
} from "./lib/scaffold-grammar.mts";
import { ensureDir, writeIfMissing } from "./lib/scaffold-io.mts";

const root = getRepositoryRoot();
const featureTemplateSrcDir = getFeatureTemplateSrcDir(root);

function resolveFeatureSrcDir(featureDir: string) {
  const srcDir = path.join(featureDir, "src");
  if (fs.existsSync(srcDir)) {
    return srcDir;
  }
  return featureDir;
}

function copyFlatTemplateFiles(
  targetDir: string,
  tokens: Record<string, string>,
) {
  for (const templateFile of listFeatureFlatTemplateFiles(root)) {
    if (featurePublicDoorFiles.includes(templateFile as (typeof featurePublicDoorFiles)[number])) {
      continue;
    }

    const sourcePath = path.join(featureTemplateSrcDir, templateFile);
    const targetName = applyTemplateTokens(
      templateFile.replace("__CODE__-example", `__CODE__-__SLICE__-example`),
      tokens,
    );
    const targetPath = path.join(targetDir, targetName);

    writeIfMissing(
      targetPath,
      applyTemplateTokens(fs.readFileSync(sourcePath, "utf8"), tokens),
    );
  }
}

function main() {
  const featureName = process.argv[2]?.trim();
  const verticalName = process.argv[3]?.trim();

  if (!featureName || !verticalName) {
    throw new Error(
      "Usage: pnpm scaffold:vertical <feature> <capability>\nExample: pnpm scaffold:vertical finance accounts-payable",
    );
  }

  if (!/^[a-z0-9-]+$/.test(featureName) || !/^[a-z0-9-]+$/.test(verticalName)) {
    throw new Error("Feature and capability names must be lowercase kebab-case.");
  }

  const featureDir = path.join(root, "packages/features", featureName);
  const featureSrcDir = resolveFeatureSrcDir(featureDir);
  if (!fs.existsSync(featureSrcDir)) {
    throw new Error(
      `Feature directory does not exist. Run pnpm scaffold:feature ${featureName} first.`,
    );
  }

  const code = featurePackageCode(featureName);
  const tokens = {
    MODULE_ID: featureName,
    CODE: code,
    SLICE: verticalName,
  };

  const featuresRoot = path.join(featureSrcDir, "features");
  ensureDir(featuresRoot);

  const verticalDir = path.join(featuresRoot, verticalName);
  ensureDir(verticalDir);

  for (const entry of fs.readdirSync(verticalDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      throw new Error(
        `Vertical slice ${featureName}/${verticalName} must stay flat. Remove subdirectory ${entry.name}/`,
      );
    }
    const violation = featureFlatFileViolation(entry.name);
    if (violation && entry.name !== "index.ts") {
      throw new Error(violation);
    }
  }

  writeIfMissing(
    path.join(verticalDir, "index.ts"),
    `/** Vertical slice door — ${featureName}/${verticalName} */\nexport {};\n`,
  );

  copyFlatTemplateFiles(verticalDir, tokens);

  for (const artifact of ["policy", "repository", "domain"] as const) {
    const placeholder = createFlatFeaturePlaceholder({
      code,
      slice: verticalName,
      artifact,
      canonical: "server",
    });
    writeIfMissing(
      path.join(verticalDir, placeholder.fileName),
      applyTemplateTokens(placeholder.contents, tokens),
    );
  }

  console.log(
    `[scaffold:vertical] ${featureName}/features/${verticalName} ready (flat slice · code=${code} · ${scaffoldRootRelativePath}/feature)`,
  );
}

main();
