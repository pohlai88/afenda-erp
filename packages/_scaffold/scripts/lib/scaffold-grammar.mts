import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsLibDir = path.dirname(fileURLToPath(import.meta.url));
const scaffoldRootDir = path.join(scriptsLibDir, "..", "..");
const repositoryRoot = path.join(scaffoldRootDir, "..", "..");

export const scaffoldRootRelativePath = "packages/_scaffold";
export const featureTemplateRelativePath = `${scaffoldRootRelativePath}/feature`;
export const platformTemplateRelativePath = `${scaffoldRootRelativePath}/platform`;

/** Legacy ARCH-1002 bucket names — grandfathered in existing features + object-storage layout checks. */
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

/** Extra legacy folders seen in mature feature packages. */
export const legacyFeatureSliceFolders = [
  "surface",
  "surfaces",
  "tools",
  "workflows",
  "agents",
  "prompts",
] as const;

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

/**
 * Flat feature file naming:
 *   {code}-{topic}.{artifact}.{canonical}.{ext}
 *   {code}-{topic}.{artifact}.{ext}
 *
 * code — first 3 letters of module id (letters/digits only)
 * artifact — command | handler | contract | schema | read-model | policy | ...
 * canonical — server | client | types | shared (optional)
 */
export const FEATURE_FLAT_FILE_PATTERN =
  /^[a-z]{3}-[a-z0-9-]+(\.[a-z0-9-]+)*\.(ts|tsx)$/;

export const FEATURE_FLAT_ARTIFACTS = [
  "action",
  "agent",
  "command",
  "component",
  "contract",
  "domain",
  "event",
  "handler",
  "policy",
  "prompt",
  "read-model",
  "repository",
  "schema",
  "surface",
  "tool",
  "workflow",
] as const;

export const FEATURE_FLAT_CANONICALS = [
  "server",
  "client",
  "types",
  "shared",
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

/** @deprecated Legacy bucket list for object-storage + grandfathered features. Scaffold is flat. */
export function readFeatureTemplateBuckets(_root = repositoryRoot): readonly string[] {
  return featureTemplateBuckets;
}

/** @deprecated Use readFeatureTemplateBuckets */
export function readTemplateBuckets(root = repositoryRoot) {
  return readFeatureTemplateBuckets(root);
}

export function isBannedBucketName(name: string) {
  return bannedBucketNames.has(name);
}

export function isFeaturePublicDoor(fileName: string) {
  return featurePublicDoorFiles.includes(
    fileName as (typeof featurePublicDoorFiles)[number],
  );
}

export function isLegacyFeatureFolder(name: string) {
  return (
    featureTemplateBuckets.includes(name as FeatureTemplateBucket) ||
    legacyFeatureSliceFolders.includes(
      name as (typeof legacyFeatureSliceFolders)[number],
    )
  );
}

/** First three alphanumeric characters of the module id — package code prefix. */
export function featurePackageCode(moduleId: string) {
  const normalized = moduleId.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normalized}xxx`.slice(0, 3);
}

export function isFeatureFlatFileName(fileName: string) {
  if (isFeaturePublicDoor(fileName)) return true;
  if (fileName === "index.ts") return true;
  return FEATURE_FLAT_FILE_PATTERN.test(fileName);
}

export function featureFlatFileViolation(fileName: string): string | null {
  if (isFeatureFlatFileName(fileName)) return null;

  return `invalid flat feature file "${fileName}" — use {code}-{topic}.{artifact}.{canonical}.{ext} (code = 3-letter module prefix). Examples: ${featurePackageCode("purchasing")}-order-create.command.server.ts, ${featurePackageCode("purchasing")}-order.schema.ts`;
}

export function listFeatureFlatTemplateFiles(root = repositoryRoot) {
  const templateSrcDir = getFeatureTemplateSrcDir(root);
  if (!fs.existsSync(templateSrcDir)) return [] as string[];

  return fs
    .readdirSync(templateSrcDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.includes("__CODE__") || isFeaturePublicDoor(name));
}

export function createFlatFeaturePlaceholder(input: {
  code: string;
  slice?: string;
  artifact: string;
  canonical?: string;
  ext?: "ts" | "tsx";
}) {
  const topic = input.slice
    ? `${input.slice}-example`
    : "example";
  const middle = input.canonical
    ? `${input.artifact}.${input.canonical}`
    : input.artifact;
  const fileName = `${input.code}-${topic}.${middle}.${input.ext ?? "ts"}`;
  return {
    fileName,
    contents: `/**
 * @afenda-feature-flat ${input.code}-${topic}.${middle}
 * Scaffold placeholder — flat src layout (${scaffoldRootRelativePath}/feature).
 */
export {};
`,
  };
}

export function applyTemplateTokens(content: string, tokens: Record<string, string>) {
  let result = content;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replaceAll(`__${key}__`, value);
  }
  return result;
}
