import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AFENDA_GOVERNED_COMPONENT_REGISTRY } from "../src/metadata/registry.ts";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const renderersDir = join(packageRoot, "src/metadata/renderers");

const rendererFiles = readdirSync(renderersDir).filter((file) =>
  file.endsWith(".renderer.tsx"),
);

const rendererIdsFromFiles = new Set(
  rendererFiles.map((file) => file.replace(/\.renderer\.tsx$/, "")),
);

const registryRendererIds = new Set(
  Object.values(AFENDA_GOVERNED_COMPONENT_REGISTRY),
);

const missingFiles = [...registryRendererIds].filter(
  (id) => !rendererIdsFromFiles.has(id),
);
const orphanFiles = [...rendererIdsFromFiles].filter(
  (id) => !registryRendererIds.has(id),
);

if (missingFiles.length > 0 || orphanFiles.length > 0) {
  console.error("Governed renderer registry drift detected.");
  if (missingFiles.length > 0) {
    console.error(`Missing renderer files: ${missingFiles.join(", ")}`);
  }
  if (orphanFiles.length > 0) {
    console.error(`Unregistered renderer files: ${orphanFiles.join(", ")}`);
  }
  process.exit(1);
}

const BANNED_IMPORT_PREFIXES = [
  "@afenda/feature-",
  "@afenda/db",
  "@afenda/auth/server",
  "@afenda/ai",
  "@afenda/workflows",
  "apps/erp",
];

const BANNED_IMPORT_PATTERNS = [
  /@afenda\/governed-surface\/src/,
  /@afenda\/ui\/src/,
  /\/dist\//,
  /\/internal\//,
];

const IMPORT_RE =
  /^\s*import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?["']([^"']+)["']/gm;

const importErrors: string[] = [];
const allRendererTsx = readdirSync(renderersDir).filter((file) =>
  file.endsWith(".tsx"),
);

for (const file of allRendererTsx) {
  const content = readFileSync(join(renderersDir, file), "utf8");
  let match: RegExpExecArray | null;
  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(content)) !== null) {
    const specifier = match[1] ?? "";
    for (const prefix of BANNED_IMPORT_PREFIXES) {
      if (specifier.startsWith(prefix)) {
        importErrors.push(
          `${file}: banned import "${specifier}" (prefix ${prefix})`,
        );
      }
    }
    for (const pattern of BANNED_IMPORT_PATTERNS) {
      if (pattern.test(specifier)) {
        importErrors.push(`${file}: banned deep import "${specifier}"`);
      }
    }
  }
}

if (importErrors.length > 0) {
  console.error("Governed renderer import allowlist violations:");
  for (const message of importErrors) {
    console.error(`  ✗ ${message}`);
  }
  process.exit(1);
}

console.log(
  `Governed renderer parity OK (${registryRendererIds.size} registry entries, import allowlist clean).`,
);
