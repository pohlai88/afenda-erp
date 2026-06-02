import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsLibDir = path.dirname(fileURLToPath(import.meta.url));
const scaffoldRootDir = path.join(scriptsLibDir, "..", "..");
const repositoryRoot = path.join(scaffoldRootDir, "..", "..");

export const scaffoldRootRelativePath = "packages/_scaffold";
export const featureTemplateRelativePath = `${scaffoldRootRelativePath}/feature`;
export const platformTemplateRelativePath = `${scaffoldRootRelativePath}/platform`;

/** Canonical feature buckets — ARCH-1002 §8. Guards and scaffold read this list. */
export const featureTemplateBuckets = [
  "actions",
  "commands",
  "api",
  "contracts",
  "components",
  "data",
  "domain",
  "events",
  "policies",
  "read-models",
  "schemas",
  "tests",
] as const;

export type FeatureTemplateBucket = (typeof featureTemplateBuckets)[number];

export const featurePublicDoorFiles = [
  "index.ts",
  "client.ts",
  "server.ts",
  "metadata.ts",
] as const;

export const platformCategories = ["runtime-library", "ui-primitives"] as const;
export type PlatformCategory = (typeof platformCategories)[number];

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

export function getScaffoldRootDir(root = repositoryRoot) {
  return path.join(root, scaffoldRootRelativePath);
}

export function getFeatureTemplateDir(root = repositoryRoot) {
  return path.join(root, featureTemplateRelativePath);
}

export function getFeatureTemplateSrcDir(root = repositoryRoot) {
  return path.join(getFeatureTemplateDir(root), "src");
}

export function getPlatformTemplateDir(root = repositoryRoot) {
  return path.join(root, platformTemplateRelativePath);
}

/** Buckets on disk under feature template src/, else canonical ARCH-1002 list. */
export function readFeatureTemplateBuckets(root = repositoryRoot): readonly string[] {
  const templateSrcDir = getFeatureTemplateSrcDir(root);
  if (!fs.existsSync(templateSrcDir)) {
    return featureTemplateBuckets;
  }

  const buckets = fs
    .readdirSync(templateSrcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return buckets.length > 0 ? buckets : featureTemplateBuckets;
}

/** @deprecated Use readFeatureTemplateBuckets — import compat for guards during migration. */
export function readTemplateBuckets(root = repositoryRoot) {
  return readFeatureTemplateBuckets(root);
}

export function isBannedBucketName(name: string) {
  return bannedBucketNames.has(name);
}

export function createBucketPlaceholder(bucketName: string, templateLabel = scaffoldRootRelativePath) {
  if (bucketName === "tests") {
    return null;
  }

  return `/**
 * @afenda-bucket ${bucketName}
 * Scaffold placeholder from ${templateLabel}.
 */
export {};
`;
}

export function applyTemplateTokens(content: string, tokens: Record<string, string>) {
  let result = content;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replaceAll(`__${key}__`, value);
  }
  return result;
}
