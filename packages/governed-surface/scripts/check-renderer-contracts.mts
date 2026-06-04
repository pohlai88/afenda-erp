/**
 * Parity guard for the governed renderer contract table.
 *
 * Run with: `pnpm lint:governed-renderer-contracts`
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AFENDA_GOVERNED_COMPONENT_REGISTRY,
  AFENDA_GOVERNED_RENDERER_CONTRACTS,
} from "../src/gov-registry.ts";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");

const rendererFiles = new Set(
  readdirSync(srcRoot)
    .filter((file) => /^gov-.+-renderer\.tsx$/.test(file))
    .map((file) => file.replace(/^gov-(.+)-renderer\.tsx$/, "$1")),
);

const registryIds = new Set(Object.values(AFENDA_GOVERNED_COMPONENT_REGISTRY));
const contractIds = new Set(Object.keys(AFENDA_GOVERNED_RENDERER_CONTRACTS));

const containerRenderers = new Set(
  Object.entries(AFENDA_GOVERNED_RENDERER_CONTRACTS)
    .filter(([, entry]) => entry.acceptedNatures.length === 0)
    .map(([id]) => id),
);

const errors: string[] = [];

for (const id of registryIds) {
  if (!contractIds.has(id)) {
    errors.push(`Registry id "${id}" has no contract entry in AFENDA_GOVERNED_RENDERER_CONTRACTS.`);
  }
}

for (const id of contractIds) {
  if (!registryIds.has(id)) {
    errors.push(`Contract id "${id}" has no matching entry in AFENDA_GOVERNED_COMPONENT_REGISTRY.`);
  }
}

for (const id of registryIds) {
  if (!rendererFiles.has(id)) {
    errors.push(`Renderer file "src/gov-${id}-renderer.tsx" is missing.`);
  }
}

for (const id of registryIds) {
  if (!containerRenderers.has(id)) {
    const contract = AFENDA_GOVERNED_RENDERER_CONTRACTS[id as keyof typeof AFENDA_GOVERNED_RENDERER_CONTRACTS];
    if (contract && contract.acceptedNatures.length === 0) {
      errors.push(`Non-container renderer "${id}" declares no acceptedNatures — add at least one dataNature or mark as container.`);
    }
  }
}

if (errors.length > 0) {
  console.error("Governed renderer contract drift detected:");
  for (const message of errors) {
    console.error(`  ✗ ${message}`);
  }
  process.exit(1);
}

console.log(
  `Governed renderer contracts OK (${registryIds.size} renderers, ${contractIds.size} contracts).`,
);
