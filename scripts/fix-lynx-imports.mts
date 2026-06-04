import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const lynxSrc = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "packages/features/lynx/src",
);

function toFlatImport(spec: string) {
  const match = spec.match(/^\.\.\/(contracts|schemas)\/lynx\.(.+)$/);
  if (!match) return null;
  return `./lyn-${match[2]!.replace(/\./g, "-")}`;
}

let changed = 0;
for (const file of fs.readdirSync(lynxSrc)) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const filePath = path.join(lynxSrc, file);
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;
  source = source.replace(
    /from\s+["'](\.\.\/(?:contracts|schemas)\/lynx\.[^"']+)["']/g,
    (_full, spec: string) => {
      const next = toFlatImport(spec);
      return next ? `from "${next}"` : _full;
    },
  );
  if (source !== original) {
    fs.writeFileSync(filePath, source);
    changed++;
  }
}

console.log(`[fix-lynx-imports] updated ${changed} files`);
