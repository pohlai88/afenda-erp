/**
 * Fix post-migration imports that still target removed bucket folders
 * (../events, ../schemas, ./schema/hr, hr-suite-integration depth, etc.)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const STATIC_REPLACEMENTS: Array<[RegExp, string]> = [
  [/import\("\.\/schema\/hr"\)/g, 'import("./hr")'],
  [/import\("\.\/schema\/hr-shift-scheduling"\)/g, 'import("./hr-shift-scheduling")'],
  [/from "\.\.\/\.\.\/\.\.\/hr-suite-integration"/g, 'from "../../hr-suite-integration"'],
  [/from '\.\.\/\.\.\/\.\.\/hr-suite-integration'/g, "from '../../hr-suite-integration'"],
  [/from "\.\/lyn-solution-provider-schema"/g, 'from "./lyn-solution-provider.schema"'],
  [/from '\.\/lyn-solution-provider-schema'/g, "from './lyn-solution-provider.schema'"],
  [
    /from "\.\/navigation\/hr-suite-nav\.contract"/g,
    'from "./hrs-hr-suite-nav-contract"',
  ],
  [
    /from "\.\/surface\/hr-suite-list-surface\.shared"/g,
    'from "./hrs-hr-suite-list-surface-shared"',
  ],
  [
    /from "\.\.\/contracts\/hr-suite-pagination\.contract"/g,
    'from "./hrs-hr-suite-pagination-contract"',
  ],
  [
    /from "\.\.\/contracts\/hr-suite-permission\.contract"/g,
    'from "./hrs-hr-suite-permission-contract"',
  ],
  [
    /from "\.\/contracts\/hr-suite-module\.contract"/g,
    'from "./hrs-hr-suite-module-contract"',
  ],
  [
    /from "\.\/contracts\/hr-suite-pagination\.contract"/g,
    'from "./hrs-hr-suite-pagination-contract"',
  ],
  [
    /from "\.\/contracts\/hr-suite-permission\.contract"/g,
    'from "./hrs-hr-suite-permission-contract"',
  ],
  [/from "\.\.\/data\//g, 'from "./'],
];

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".turbo") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findSiblingBySuffix(dir: string, suffix: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const matches = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(suffix) && /\.(ts|tsx)$/.test(name));
  if (matches.length !== 1) return null;
  return `./${matches[0]!.replace(/\.(tsx?|mts)$/, "")}`;
}

function resolveLegacyBucketImport(fromFile: string, spec: string): string | null {
  const dir = path.dirname(fromFile);
  const legacyMap: Record<string, string> = {
    "../events": ".event.ts",
    "../schemas": ".schema.ts",
    "../policies": ".policy.server.ts",
  };

  if (spec in legacyMap) {
    const sibling = findSiblingBySuffix(dir, legacyMap[spec]!);
    if (sibling) return sibling;
  }

  if (spec === "../contracts") {
    const contracts = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".contract.ts"));
    if (contracts.length === 1) {
      return `./${contracts[0]!.replace(/\.ts$/, "")}`;
    }
    const contractBarrel = fs
      .readdirSync(dir)
      .find((name) => name.endsWith(".contracts.ts") || name === "contracts.ts");
    if (contractBarrel) {
      return `./${contractBarrel.replace(/\.(tsx?|mts)$/, "")}`;
    }
  }

  return null;
}

let changed = 0;

for (const filePath of walk(path.join(root, "packages"))) {
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;

  for (const [pattern, replacement] of STATIC_REPLACEMENTS) {
    source = source.replace(pattern, replacement);
  }

  source = source.replace(
    /(from\s+["'])(\.[^"']+)(["'])/g,
    (match, pre, spec, post) => {
      const resolved = resolveLegacyBucketImport(filePath, spec);
      return resolved ? `${pre}${resolved}${post}` : match;
    },
  );

  if (source !== original) {
    fs.writeFileSync(filePath, source);
    changed++;
    console.log(`[legacy-imports] ${path.relative(root, filePath)}`);
  }
}

console.log(`[legacy-imports] updated ${changed} files`);
