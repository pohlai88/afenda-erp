import {
  parseMetadataUiPermissionContract,
  type MetadataUiCapabilityKey,
  type MetadataUiPermissionContract,
  type MetadataUiPermissionContractInput,
} from "../contracts/permission.contract";

export type MetadataUiSecurityScope = "section" | "action" | "field" | "route";

export type MetadataUiSecurityPolicyInput = Readonly<{
  key: string;
  scope: MetadataUiSecurityScope;
  permission?: MetadataUiPermissionContractInput | MetadataUiPermissionContract;
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type MetadataUiSecurityPolicy = Readonly<{
  key: string;
  scope: MetadataUiSecurityScope;
  permission?: MetadataUiPermissionContract;
  metadata: Readonly<Record<string, unknown>>;
}>;

export type MetadataUiCapabilityInventoryInput =
  | Iterable<MetadataUiCapabilityKey | string>
  | ReadonlySet<MetadataUiCapabilityKey | string>
  | undefined;

export function normalizeMetadataUiCapabilityKeys(
  capabilities: MetadataUiCapabilityInventoryInput,
): readonly MetadataUiCapabilityKey[] {
  if (!capabilities) {
    return [];
  }

  return Array.from(
    new Set(
      Array.from(capabilities, (capability) =>
        typeof capability === "string" ? capability.trim() : String(capability),
      ),
    ),
  ).filter(
    (capability): capability is MetadataUiCapabilityKey =>
      /^[a-z][a-z0-9]*(?:[._][a-z0-9]+)*$/.test(capability),
  );
}

export function createMetadataUiCapabilitySet(
  capabilities: MetadataUiCapabilityInventoryInput,
): ReadonlySet<MetadataUiCapabilityKey> {
  return new Set(normalizeMetadataUiCapabilityKeys(capabilities));
}

export function createMetadataUiSecurityPolicy(
  input: MetadataUiSecurityPolicyInput,
): MetadataUiSecurityPolicy {
  return {
    key: input.key,
    scope: input.scope,
    permission: input.permission
      ? parseMetadataUiPermissionContract(input.permission)
      : undefined,
    metadata: {
      ...(input.metadata ?? {}),
    },
  };
}
