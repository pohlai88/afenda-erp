export type { GovernedRenderableState } from "../schemas/governed-component-state.schema";

export type GovernedIdentity = {
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export type GovernedIdentityAttributes = {
  "data-surface-key"?: string;
  "data-section-key"?: string;
  "data-component-key"?: string;
};

export function toGovernedDomId(prefix: string, key: string): string {
  const normalized = `${prefix}-${key}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "governed-unknown";
}

export function governedHeadingId(kind: string, key: string): string {
  return toGovernedDomId(`governed-${kind}`, `${key}-title`);
}

export function governedDescriptionId(kind: string, key: string): string {
  return toGovernedDomId(`governed-${kind}`, `${key}-description`);
}

export function governedTestId(kind: string, key: string): string {
  return `governed:${kind}:${key}`.toLowerCase().replace(/\s+/g, "-");
}

export function governedIdentityAttributes(
  identity?: GovernedIdentity,
): GovernedIdentityAttributes {
  if (!identity) {
    return {};
  }

  const attrs: GovernedIdentityAttributes = {};

  if (identity.surfaceKey) {
    attrs["data-surface-key"] = identity.surfaceKey;
  }
  if (identity.sectionKey) {
    attrs["data-section-key"] = identity.sectionKey;
  }
  if (identity.componentKey) {
    attrs["data-component-key"] = identity.componentKey;
  }

  return attrs;
}
