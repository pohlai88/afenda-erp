import { readdirSync } from "node:fs";
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

console.log(
  `Governed renderer parity OK (${registryRendererIds.size} registry entries).`,
);
