/**
 * Parity guard for the governed renderer contract table.
 *
 * Verifies that every `AfendaGovernedRendererId` in the registry:
 *   1. Has a matching entry in `AFENDA_GOVERNED_RENDERER_CONTRACTS`.
 *   2. Has a shipped renderer file at `src/metadata/renderers/<id>.renderer.tsx`.
 *   3. `acceptedNatures` is non-empty for all non-container renderers.
 *
 * Run with: `pnpm lint:governed-renderer-contracts`
 *
 * Mutate `registry.ts` → `AFENDA_GOVERNED_RENDERER_CONTRACTS` and the
 * `.cursor/rules/governed-renderer-contract.mdc` table in the same PR.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AFENDA_GOVERNED_COMPONENT_REGISTRY,
  AFENDA_GOVERNED_RENDERER_CONTRACTS,
} from "../src/metadata/registry.ts";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const renderersDir = join(packageRoot, "src/metadata/renderers");

const rendererFiles = new Set(
  readdirSync(renderersDir)
    .filter((file) => file.endsWith(".renderer.tsx"))
    .map((file) => file.replace(/\.renderer\.tsx$/, "")),
);

const registryIds = new Set(Object.values(AFENDA_GOVERNED_COMPONENT_REGISTRY));
const contractIds = new Set(Object.keys(AFENDA_GOVERNED_RENDERER_CONTRACTS));

/** Container-only renderers — legitimately have no dataNature. */
const containerRenderers = new Set(
  Object.entries(AFENDA_GOVERNED_RENDERER_CONTRACTS)
    .filter(([, entry]) => entry.acceptedNatures.length === 0)
    .map(([id]) => id),
);

const errors: string[] = [];

// 1. Every registry id must have a contract entry.
for (const id of registryIds) {
  if (!contractIds.has(id)) {
    errors.push(`Registry id "${id}" has no contract entry in AFENDA_GOVERNED_RENDERER_CONTRACTS.`);
  }
}

// 2. Every contract id must have a registry entry (no orphan contracts).
for (const id of contractIds) {
  if (!registryIds.has(id)) {
    errors.push(`Contract id "${id}" has no matching entry in AFENDA_GOVERNED_COMPONENT_REGISTRY.`);
  }
}

// 3. Every registry id must have a renderer file.
for (const id of registryIds) {
  if (!rendererFiles.has(id)) {
    errors.push(`Renderer file "src/metadata/renderers/${id}.renderer.tsx" is missing.`);
  }
}

// 4. Non-container renderers must declare at least one acceptedNature.
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
