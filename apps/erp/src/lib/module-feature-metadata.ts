import { isCoreModuleId, type ModuleFeatureMetadata } from "@afenda/kernel/feature-metadata";
import { moduleId as hrModuleId } from "@afenda/feature-hr-suite/metadata";
import * as hrMetadata from "@afenda/feature-hr-suite/metadata";
import type { ModuleId } from "@afenda/config/module-ids";

const moduleMetadataById: Partial<Record<ModuleId, ModuleFeatureMetadata>> = {
  [hrModuleId]: hrMetadata as ModuleFeatureMetadata,
};

export function resolveModuleFeatureMetadata(moduleId: ModuleId) {
  if (!isCoreModuleId(moduleId)) return null;
  return moduleMetadataById[moduleId] ?? null;
}

export function getModuleFeatureMetadata(moduleId: ModuleId) {
  const metadata = resolveModuleFeatureMetadata(moduleId);
  if (!metadata) {
    throw new Error(`No feature metadata registered for module ${moduleId}.`);
  }

  return metadata;
}
