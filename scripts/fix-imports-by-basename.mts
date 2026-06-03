/**
 * Resolve broken relative imports using basename index per package src tree.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listPackageScanTargets } from "./lib/packages-layout.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function stemVariants(filePath: string, packageDirName: string) {
  const base = path.basename(filePath).replace(/\.(tsx?|mts)$/, "");
  const code = packageDirName.slice(0, 3);
  const variants = new Set<string>([base]);
  variants.add(base.replace(/^app-/, "appshell."));
  variants.add(base.replace(/^app-appshell-/, "appshell."));
  variants.add(base.replace(/^app-/, ""));
  variants.add(base.replace(/-/g, "."));
  if (base.startsWith("app-")) {
    variants.add(base.slice(4).replace(/-/g, "."));
  }
  if (base.startsWith(`${code}-`) || base.startsWith(`${packageDirName.slice(0, 3)}-`)) {
    variants.add(base.replace(/^[a-z]{3}-/, "").replace(/-/g, "."));
  }
  const prefix = base.split("-")[0];
  if (prefix && base.includes("-")) {
    variants.add(base.slice(prefix.length + 1).replace(/-/g, "."));
  }
  return [...variants];
}

function buildIndex(srcRoot: string, packageDirName: string) {
  const index = new Map<string, string>();
  for (const file of walk(srcRoot)) {
    for (const variant of stemVariants(file, packageDirName)) {
      if (!index.has(variant)) index.set(variant, file);
    }
  }
  return index;
}

function resolveImport(fromFile: string, spec: string, index: Map<string, string>) {
  if (!spec.startsWith(".")) return null;
  const absBase = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    absBase,
    `${absBase}.ts`,
    `${absBase}.tsx`,
    path.join(absBase, "index.ts"),
    path.join(absBase, "index.tsx"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return null;
  }

  const specStem = path.basename(spec).replace(/\.(tsx?|mts)$/, "");
  let target = index.get(specStem);
  if (!target) {
    target = index.get(specStem.replace(/\./g, "-"));
  }
  if (!target) return null;

  let rel = path.relative(path.dirname(fromFile), target).split(path.sep).join("/");
  rel = rel.replace(/\.(tsx?|mts)$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

let changed = 0;

for (const target of listPackageScanTargets(path.join(root, "packages"))) {
  const index = buildIndex(target.srcRoot, target.packageDirName);
  const files = walk(target.srcRoot);

  for (const filePath of files) {
    let source = fs.readFileSync(filePath, "utf8");
    const original = source;

    source = source.replace(
      /(from\s+["'])(\.[^"']+)(["'])/g,
      (match, pre, spec, post) => {
        const resolved = resolveImport(filePath, spec, index);
        return resolved ? `${pre}${resolved}${post}` : match;
      },
    );

    source = source.replace(
      /(export\s+\*\s+from\s+["'])(\.[^"']+)(["'])/g,
      (match, pre, spec, post) => {
        const resolved = resolveImport(filePath, spec, index);
        return resolved ? `${pre}${resolved}${post}` : match;
      },
    );

    if (source !== original) {
      fs.writeFileSync(filePath, source);
      changed++;
    }
  }
}

for (const broken of [
  ["packages/appshell/src/app-tsx", "packages/appshell/src/app-app-shell.server.tsx"],
  ["packages/governed-surface/src/gov-tsx", "packages/governed-surface/src/gov-governed-heading.server.tsx"],
]) {
  const [from, to] = broken;
  if (fs.existsSync(path.join(root, from))) {
    fs.renameSync(path.join(root, from), path.join(root, to));
    changed++;
  }
}

console.log(`[fix-imports-basename] touched ${changed} items`);
