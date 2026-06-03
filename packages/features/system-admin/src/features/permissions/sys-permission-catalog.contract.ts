import {
  appCapabilities,
  isAppCapability,
  type AppCapability,
} from "@afenda/auth";

export type SystemAdminCatalogOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  description: string;
};

function labelFromKey(key: string) {
  return key
    .split(/[.-]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const systemAdminPermissionCatalog = appCapabilities.map(
  (capability) => ({
    value: capability,
    label: labelFromKey(capability),
    description: `Catalog permission ${capability}.`,
  }),
) satisfies readonly SystemAdminCatalogOption<AppCapability>[];

export function isSystemAdminPermissionKey(
  value: string,
): value is AppCapability {
  return isAppCapability(value);
}
