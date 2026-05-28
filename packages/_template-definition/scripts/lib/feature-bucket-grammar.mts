import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templateScriptsLibDir = path.dirname(fileURLToPath(import.meta.url));
const templateDefinitionDir = path.join(templateScriptsLibDir, "..", "..");
const repositoryRoot = path.join(templateDefinitionDir, "..", "..");

export const templateDefinitionRelativePath = "packages/_template-definition";
export const templateSourceRelativePath = `${templateDefinitionRelativePath}/src`;

export const bannedBucketNames = new Set([
  "_shared",
  "shared",
  "common",
  "lib",
  "utils",
  "helpers",
  "misc",
  "internal",
]);

/** Default buckets when template folders are not on disk yet. */
export const defaultTemplateBuckets = [
  "actions",
  "components",
  "contracts",
  "data",
  "events",
  "policies",
  "schemas",
  "tests",
] as const;

export const featurePublicDoorFiles = [
  "index.ts",
  "client.ts",
  "server.ts",
  "metadata.ts",
] as const;

export const appRouteAllowedTsxNames = new Set([
  "page.tsx",
  "layout.tsx",
  "loading.tsx",
  "error.tsx",
  "template.tsx",
  "default.tsx",
  "not-found.tsx",
  "forbidden.tsx",
  "unauthorized.tsx",
]);

export const clientOnlyImportBans = [
  "@afenda/db",
  "@afenda/ai",
  "@afenda/workflows",
  "@afenda/auth/server",
  "node:",
] as const;

export function getRepositoryRoot() {
  return repositoryRoot;
}

export function getTemplateDefinitionDir(root = repositoryRoot) {
  return path.join(root, templateDefinitionRelativePath);
}

export function getTemplateSourceDir(root = repositoryRoot) {
  return path.join(root, templateSourceRelativePath);
}

export function readTemplateBuckets(root = repositoryRoot): readonly string[] {
  const templateSrcDir = getTemplateSourceDir(root);
  if (!fs.existsSync(templateSrcDir)) {
    return defaultTemplateBuckets;
  }

  const buckets = fs
    .readdirSync(templateSrcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return buckets.length > 0 ? buckets : defaultTemplateBuckets;
}

/** @deprecated Use readTemplateBuckets() - kept for import compatibility during migration. */
export const featureBaseBuckets = defaultTemplateBuckets;

export function isBannedBucketName(name: string) {
  return bannedBucketNames.has(name);
}

export function createBucketPlaceholder(bucketName: string) {
  if (bucketName === "tests") {
    return null;
  }

  return `/**
 * @afenda-bucket ${bucketName}
 * Scaffold placeholder from packages/_template-definition.
 */
export {};
`;
}
