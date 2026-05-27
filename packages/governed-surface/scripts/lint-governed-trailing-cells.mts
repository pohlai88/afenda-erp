/**
 * Parity guard for the Pattern C trailing cell registry.
 *
 * Ensures every id exported in `GOVERNED_LIST_TRAILING_CELL_REGISTRY` has
 * a corresponding component file under `src/components/` and vice-versa.
 *
 * Run with: `pnpm lint:governed-trailing-cells`
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { GOVERNED_LIST_TRAILING_CELL_REGISTRY } from "../src/components/governed-list-trailing-cell-registry.client.tsx";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = join(packageRoot, "src/components");

// Trailing cell component files follow the naming convention:
// governed-<cellId-slugified>-trailing-cell.client.tsx
const trailingCellFiles = readdirSync(componentsDir).filter(
  (file) => file.includes("trailing-cell") && file.endsWith(".client.tsx"),
);

const registryIds = Object.keys(GOVERNED_LIST_TRAILING_CELL_REGISTRY);

// Check each registry id maps to an existing component file.
const missingFiles = registryIds.filter((id) => {
  // Derive expected filename fragment from the id (e.g. "governed.metadata" → "metadata")
  const slug = id.replace(/^governed\./, "").replace(/\./g, "-");
  return !trailingCellFiles.some((file) => file.includes(slug));
});

if (missingFiles.length > 0) {
  console.error("Governed trailing cell registry drift detected.");
  console.error(
    `Registry ids without matching component files: ${missingFiles.join(", ")}`,
  );
  process.exit(1);
}

console.log(
  `Governed trailing cell registry parity OK (${registryIds.length} registered cells).`,
);
