import fs from "node:fs";
import path from "node:path";
import {
  createBucketPlaceholder,
  featurePublicDoorFiles,
  getRepositoryRoot,
  getTemplateDefinitionDir,
  getTemplateSourceDir,
  readTemplateBuckets,
} from "./lib/feature-bucket-grammar.mts";

const root = getRepositoryRoot();
const templateDir = getTemplateDefinitionDir(root);
const templateSrcDir = getTemplateSourceDir(root);

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function copyTemplatePath(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  if (fs.statSync(sourcePath).isDirectory()) {
    ensureDir(targetPath);
    for (const child of fs.readdirSync(sourcePath, { withFileTypes: true })) {
      copyTemplatePath(
        path.join(sourcePath, child.name),
        path.join(targetPath, child.name),
      );
    }
    return true;
  }

  writeIfMissing(targetPath, fs.readFileSync(sourcePath, "utf8"));
  return true;
}

function copyTemplateDoor(name: string, featureSrcDir: string, featureName: string) {
  const sourcePath = path.join(templateDir, name);
  const targetPath = path.join(featureSrcDir, name);

  if (copyTemplatePath(sourcePath, targetPath)) {
    if (name === "metadata.ts") {
      const metadataContents = fs.readFileSync(targetPath, "utf8");
      fs.writeFileSync(
        targetPath,
        metadataContents.replaceAll("__MODULE_ID__", featureName),
        "utf8",
      );
    }
    return;
  }

  const doorKind = path.basename(name, ".ts");
  writeIfMissing(
    targetPath,
    `/**
 * Public ${doorKind} door for this feature package.
 * Scaffolded from packages/_template-definition.
 */
export {};
`,
  );
}

function copyTemplateBucket(bucket: string, featureSrcDir: string) {
  const sourcePath = path.join(templateSrcDir, bucket);
  const targetPath = path.join(featureSrcDir, bucket);

  if (copyTemplatePath(sourcePath, targetPath)) {
    return;
  }

  ensureDir(targetPath);
  const placeholder = createBucketPlaceholder(bucket);
  if (placeholder) {
    writeIfMissing(path.join(targetPath, "index.ts"), placeholder);
  }
}

function scaffoldMissingBuckets(featureSrcDir: string) {
  for (const bucket of readTemplateBuckets(root)) {
    const bucketDir = path.join(featureSrcDir, bucket);
    ensureDir(bucketDir);
    const placeholder = createBucketPlaceholder(bucket);
    if (placeholder) {
      writeIfMissing(path.join(bucketDir, "index.ts"), placeholder);
    }
  }
}

function writeFeatureAgents(featureDir: string, featureName: string) {
  const buckets = readTemplateBuckets(root)
    .map((bucket) => `- \`src/${bucket}/\``)
    .join("\n");
  writeIfMissing(
    path.join(featureDir, "AGENTS.md"),
    `# @afenda/feature-${featureName}

Scaffold default: \`packages/_template-definition\`.

## Public doors
- \`src/index.ts\`
- \`src/client.ts\`
- \`src/server.ts\`
- \`src/metadata.ts\`

## Buckets
${buckets}

## Constraints
- Module components live in \`src/components/\`, not \`apps/erp\`.
- TypeScript schemas live in \`src/schemas/\`; \`@afenda/db\` owns SQL and migrations.
- Import public doors only (., ./client, ./server, ./metadata).
`,
  );
}

function main() {
  const featureName = process.argv[2]?.trim();

  if (!featureName) {
    throw new Error(
      "Usage: pnpm scaffold:feature <module-id>\nExample: pnpm scaffold:feature approvals",
    );
  }

  if (!/^[a-z0-9-]+$/.test(featureName)) {
    throw new Error(
      `Feature name must be lowercase kebab-case. Received: ${featureName}`,
    );
  }

  const featureDir = path.join(root, "packages/features", featureName);
  const featureSrcDir = path.join(featureDir, "src");
  ensureDir(featureSrcDir);

  for (const door of featurePublicDoorFiles) {
    copyTemplateDoor(door, featureSrcDir, featureName);
  }

  for (const bucket of readTemplateBuckets(root)) {
    copyTemplateBucket(bucket, featureSrcDir);
  }

  scaffoldMissingBuckets(featureSrcDir);
  writeFeatureAgents(featureDir, featureName);

  console.log(
    `[scaffold:feature] ${featureName} ready from _template-definition (${readTemplateBuckets(root).length} src buckets)`,
  );
}

main();
