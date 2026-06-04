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
  variants.add(base.replace(/\./g, "-"));
  variants.add(base.replace(/^app-/, "appshell."));
  variants.add(base.replace(/^app-appshell-/, "appshell."));
  variants.add(base.replace(/^app-/, ""));
  variants.add(base.replace(/-/g, "."));
  variants.add(base.replace(/\./g, "-").replace(/-/g, "."));
  if (base.startsWith("app-")) {
    variants.add(base.slice(4).replace(/-/g, "."));
  }
  if (base.startsWith("lyn-")) {
    const rest = base.slice(4);
    variants.add(`lynx.${rest}`);
    variants.add(`lynx-${rest}`);
    variants.add(`lynx.${rest.replace(/-/g, ".")}`);
    variants.add(`lynx-${rest.replace(/\./g, "-")}`);
  }
  if (base.startsWith("kno-")) {
    const rest = base.slice(4);
    variants.add(`knowledge.${rest}`);
    variants.add(`knowledge-${rest}`);
    variants.add(`knowledge.${rest.replace(/-/g, ".")}`);
    variants.add(`knowledge-${rest.replace(/\./g, "-")}`);
  }
  if (base.startsWith("sys-")) {
    const rest = base.slice(4);
    variants.add(`system-admin.${rest}`);
    variants.add(`system-admin-${rest}`);
    variants.add(`system-admin.${rest.replace(/-/g, ".")}`);
    variants.add(`system-admin-${rest.replace(/\./g, "-")}`);
  }
  if (base.startsWith(`${code}-`) || base.startsWith(`${packageDirName.slice(0, 3)}-`)) {
    const strippedPrefix = base.replace(/^[a-z]{3}-/, "");
    variants.add(strippedPrefix);
    variants.add(strippedPrefix.replace(/-/g, "."));
    variants.add(strippedPrefix.replace(/\./g, "-"));
  }
  const prefix = base.split("-")[0];
  if (prefix && base.includes("-")) {
    const strippedPrefix = base.slice(prefix.length + 1);
    variants.add(strippedPrefix);
    variants.add(strippedPrefix.replace(/-/g, "."));
    variants.add(strippedPrefix.replace(/\./g, "-"));
  }
  return [...variants];
}

function compactStem(stem: string) {
  return stem.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function buildIndex(srcRoot: string, packageDirName: string) {
  const index = new Map<string, string>();
  for (const file of walk(srcRoot)) {
    for (const variant of stemVariants(file, packageDirName)) {
      if (!index.has(variant)) index.set(variant, file);
      const compact = compactStem(variant);
      if (!index.has(compact)) index.set(compact, file);
    }
  }
  return index;
}

const systemAdminAliasKinds = new Set([
  "actions",
  "contracts",
  "data",
  "policies",
  "schemas",
  "surface",
]);

function extractExportedNames(filePath: string) {
  const source = fs.readFileSync(filePath, "utf8");
  const names = new Set<string>();

  const directExport =
    /\bexport\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of source.matchAll(directExport)) {
    const exportedName = match[1];
    if (exportedName) names.add(exportedName);
  }

  const namedExport =
    /\bexport\s+(?:type\s+)?\{([\s\S]*?)\}(?:\s+from\s+["'][^"']+["'])?/g;
  for (const match of source.matchAll(namedExport)) {
    const exportBody = match[1];
    if (!exportBody) continue;
    for (const rawPart of exportBody.split(",")) {
      const part = rawPart
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/g, "")
        .trim();
      if (!part) continue;
      const withoutType = part.replace(/^type\s+/, "").trim();
      const aliasMatch = withoutType.match(/\s+as\s+([A-Za-z_$][\w$]*)$/);
      const name = aliasMatch?.[1] ?? withoutType.split(/\s+/)[0];
      if (name && name !== "default") names.add(name);
    }
  }

  return names;
}

function kindFileScore(filePath: string, kind: string) {
  const base = path.basename(filePath);
  if (kind === "contracts") {
    if (/\.contract\./.test(base)) return 0;
    if (/\.shared\./.test(base)) return 4;
  }
  if (kind === "schemas") {
    if (/\.schema\./.test(base)) return 0;
  }
  if (kind === "surface") {
    if (/\.surface\./.test(base)) return 0;
    if (/\.shared\./.test(base)) return 4;
  }
  if (kind === "actions") {
    if (/\.actions\.server\./.test(base)) return 0;
    if (/\.actions\.contract\./.test(base)) return 2;
  }
  if (kind === "data") {
    if (/\.(page-model|query|repository|mapper)\./.test(base)) return 0;
    if (/\.shared\./.test(base)) return 4;
  }
  if (kind === "policies") {
    if (/\.policy\.server\./.test(base)) return 0;
  }
  return 10;
}

function toRelativeImport(fromFile: string, targetFile: string) {
  let rel = path.relative(path.dirname(fromFile), targetFile).split(path.sep).join("/");
  rel = rel.replace(/\.(tsx?|mts)$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function buildSystemAdminFeatureIndexes(srcRoot: string) {
  const featuresRoot = path.join(srcRoot, "features");
  const byFeature = new Map<
    string,
    {
      dir: string;
      filesByKind: Map<string, string[]>;
      symbols: Map<string, string[]>;
    }
  >();

  if (!fs.existsSync(featuresRoot)) return byFeature;

  for (const entry of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const dir = path.join(featuresRoot, entry.name);
    const files = walk(dir);
    const filesByKind = new Map<string, string[]>();
    const symbols = new Map<string, string[]>();

    for (const file of files) {
      const base = path.basename(file);
      for (const kind of systemAdminAliasKinds) {
        const matchesKind =
          (kind === "contracts" && /\.contract\./.test(base)) ||
          (kind === "schemas" && /\.schema\./.test(base)) ||
          (kind === "surface" && /\.surface\./.test(base)) ||
          (kind === "actions" && /\.actions\./.test(base)) ||
          (kind === "data" && /\.(page-model|query|repository|mapper)\./.test(base)) ||
          (kind === "policies" && /\.policy\.server\./.test(base));
        if (matchesKind) {
          const bucket = filesByKind.get(kind) ?? [];
          bucket.push(file);
          filesByKind.set(kind, bucket);
        }
      }

      for (const name of extractExportedNames(file)) {
        const exports = symbols.get(name) ?? [];
        exports.push(file);
        symbols.set(name, exports);
      }
    }

    byFeature.set(entry.name, { dir, filesByKind, symbols });
  }

  return byFeature;
}

const systemAdminFeatureIndexCache = new Map<
  string,
  ReturnType<typeof buildSystemAdminFeatureIndexes>
>();

function getSystemAdminFeatureIndexes(srcRoot: string) {
  const cached = systemAdminFeatureIndexCache.get(srcRoot);
  if (cached) return cached;
  const indexes = buildSystemAdminFeatureIndexes(srcRoot);
  systemAdminFeatureIndexCache.set(srcRoot, indexes);
  return indexes;
}

function inferSystemAdminAlias(
  filePath: string,
  spec: string,
  srcRoot: string,
  featureIndexes: Map<
    string,
    {
      dir: string;
      filesByKind: Map<string, string[]>;
      symbols: Map<string, string[]>;
    }
  >,
) {
  if (!spec.startsWith(".")) return null;

  const normalizedSpec = spec.replace(/\\/g, "/");
  const parts = normalizedSpec.split("/").filter(Boolean);
  const kind = parts[parts.length - 1];
  if (!kind) return null;
  if (!systemAdminAliasKinds.has(kind)) return null;

  let feature = parts.length > 1 ? parts[parts.length - 2] ?? null : null;
  if (!feature || feature === "." || feature === ".." || feature === "src" || feature === "features") {
    const relativeToFeatures = path
      .relative(path.join(srcRoot, "features"), filePath)
      .split(path.sep);
    feature = relativeToFeatures.length > 1 ? relativeToFeatures[0] ?? null : null;
  }

  if (!feature || !featureIndexes.has(feature)) return null;
  return { kind, feature };
}

function parseImportSpecifier(raw: string) {
  const trimmed = raw.trim();
  const isTypeOnly = trimmed.startsWith("type ");
  const withoutType = isTypeOnly ? trimmed.slice(5).trim() : trimmed;
  const match = withoutType.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?$/);
  if (!match) return null;
  const exportedName = match[1];
  if (!exportedName) return null;
  return {
    exportedName,
    text: trimmed,
    isTypeOnly,
  };
}

function rewriteSystemAdminAliasImports(source: string, filePath: string, srcRoot: string) {
  const featureIndexes = getSystemAdminFeatureIndexes(srcRoot);
  if (featureIndexes.size === 0) return source;

  source = source.replace(
    /export\s+\*\s+from\s+["']\.\/(contracts|schemas|surface)["'];/g,
    (match, kind) => {
      const alias = inferSystemAdminAlias(filePath, `./${kind}`, srcRoot, featureIndexes);
      if (!alias) return match;
      const featureIndex = featureIndexes.get(alias.feature);
      const files = featureIndex?.filesByKind.get(alias.kind) ?? [];
      if (files.length === 0) return match;
      return [...new Set(files)]
        .sort((left, right) => left.localeCompare(right))
        .map((file) => `export * from "${toRelativeImport(filePath, file)}";`)
        .join("\n");
    },
  );

  source = source.replace(
    /import(\s+type)?\s*\{([\s\S]*?)\}\s*from\s*["']([^"']+)["'];/g,
    (match, topLevelType: string | undefined, importBody: string, spec: string) => {
      const alias = inferSystemAdminAlias(filePath, spec, srcRoot, featureIndexes);
      if (!alias) return match;

      const featureIndex = featureIndexes.get(alias.feature);
      if (!featureIndex) return match;

      const groups = new Map<
        string,
        {
          target: string;
          specifiers: string[];
          typeOnly: boolean;
        }
      >();

      for (const rawSpecifier of importBody.split(",")) {
        if (!rawSpecifier.trim()) continue;
        const specifier = parseImportSpecifier(rawSpecifier);
        if (!specifier) return match;

        const candidateFiles = featureIndex.symbols.get(specifier.exportedName);
        if (!candidateFiles?.length) return match;

        const target = [...candidateFiles].sort((left, right) => {
          const score = kindFileScore(left, alias.kind) - kindFileScore(right, alias.kind);
          return score || left.localeCompare(right);
        })[0];
        if (!target) return match;

        const rel = toRelativeImport(filePath, target);
        const group = groups.get(rel) ?? {
          target: rel,
          specifiers: [],
          typeOnly: Boolean(topLevelType),
        };
        group.specifiers.push(
          topLevelType && specifier.isTypeOnly
            ? specifier.text.replace(/^type\s+/, "")
            : specifier.text,
        );
        group.typeOnly = group.typeOnly && (Boolean(topLevelType) || specifier.isTypeOnly);
        groups.set(rel, group);
      }

      if (groups.size === 0) return match;

      return [...groups.values()]
        .map((group) => {
          const typeKeyword = group.typeOnly ? " type" : "";
          const body = group.specifiers.join(", ");
          return `import${typeKeyword} { ${body} } from "${group.target}";`;
        })
        .join("\n");
    },
  );

  return source;
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
  if (!target) {
    target = index.get(specStem.replace(/-/g, "."));
  }
  if (!target) {
    target = index.get(compactStem(specStem));
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
  const packageRoot = path.dirname(target.srcRoot);
  const testRoot = path.join(packageRoot, "tests");
  const files = [
    ...walk(target.srcRoot),
    ...(fs.existsSync(testRoot) ? walk(testRoot) : []),
  ];

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

    source = source.replace(
      /(import\s*\(\s*["'])(\.[^"']+)(["']\s*\))/g,
      (match, pre, spec, post) => {
        const resolved = resolveImport(filePath, spec, index);
        return resolved ? `${pre}${resolved}${post}` : match;
      },
    );

    if (target.packageDirName === "system-admin") {
      source = rewriteSystemAdminAliasImports(source, filePath, target.srcRoot);
    }

    if (source !== original) {
      fs.writeFileSync(filePath, source);
      changed++;
    }
  }
}

for (const broken of [
  ["packages/appshell/src/app-tsx", "packages/appshell/src/app-app-shell.server.tsx"],
  ["packages/governed-surface/src/gov-tsx", "packages/governed-surface/src/gov-governed-heading.server.tsx"],
] as const) {
  const [from, to] = broken;
  if (fs.existsSync(path.join(root, from))) {
    fs.renameSync(path.join(root, from), path.join(root, to));
    changed++;
  }
}

console.log(`[fix-imports-basename] touched ${changed} items`);
