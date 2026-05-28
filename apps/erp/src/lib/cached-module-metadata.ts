import { cacheLife, cacheTag } from "next/cache";
import {
  getErpModuleById,
  getNavigationExtensionById,
  type ModuleId,
} from "@afenda/kernel";
import type { Metadata } from "next";

export async function getCachedModuleMetadata(
  moduleId: ModuleId,
): Promise<Metadata | null> {
  "use cache";
  cacheTag(`module-metadata:${moduleId}`);
  cacheLife("hours");

  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    return null;
  }

  return {
    title: moduleDefinition.label,
    description: moduleDefinition.description,
  };
}

export async function getCachedNavigationExtensionMetadata(
  extensionId: string,
): Promise<Metadata | null> {
  "use cache";
  cacheTag(`navigation-extension:${extensionId}`);
  cacheLife("hours");

  const extension = getNavigationExtensionById(extensionId);

  if (!extension) {
    return null;
  }

  return {
    title: extension.label,
    description: extension.description,
  };
}
