export type MetadataUiTestIdPart = string | number | boolean | undefined | null;

export function normalizeMetadataUiIdentityPart(
  part: MetadataUiTestIdPart,
): string | undefined {
  if (part === null || part === undefined || part === "") {
    return undefined;
  }

  const normalized = String(part)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : undefined;
}

export function createMetadataUiTestId(
  ...parts: readonly MetadataUiTestIdPart[]
): string {
  return parts
    .map((part) => normalizeMetadataUiIdentityPart(part))
    .filter((part): part is string => Boolean(part))
    .join("-");
}
