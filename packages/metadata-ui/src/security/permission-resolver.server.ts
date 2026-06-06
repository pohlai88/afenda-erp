import "server-only";

import {
  parseMetadataUiPermissionContract,
  type MetadataUiCapabilityKey,
  type MetadataUiPermissionContract,
  type MetadataUiPermissionContractInput,
  type MetadataUiPermissionRequirement,
  type MetadataUiPermissionVisibility,
} from "../contracts/permission.contract";
import {
  createMetadataUiCapabilitySet,
  type MetadataUiCapabilityInventoryInput,
} from "./route-policy.shared";

export type MetadataUiCapabilityPredicate = (
  capability: MetadataUiCapabilityKey,
) => boolean;

export type MetadataUiPermissionSubject = Readonly<{
  capabilities?: MetadataUiCapabilityInventoryInput;
  hasCapability?: MetadataUiCapabilityPredicate;
}>;

export type MetadataUiPermissionResolutionState =
  | "unrestricted"
  | "allowed"
  | "denied";

export type MetadataUiPermissionRequirementResolution = Readonly<{
  requirement: MetadataUiPermissionRequirement;
  granted: boolean;
  satisfied: boolean;
}>;

export type MetadataUiPermissionResolution = Readonly<{
  state: MetadataUiPermissionResolutionState;
  allowed: boolean;
  visibility: MetadataUiPermissionVisibility;
  failure: MetadataUiPermissionContract["failure"];
  operator: MetadataUiPermissionContract["operator"];
  requirements: readonly MetadataUiPermissionRequirementResolution[];
  satisfiedRequirements: readonly MetadataUiPermissionRequirementResolution[];
  failedRequirements: readonly MetadataUiPermissionRequirementResolution[];
}>;

function hasMetadataUiCapability(
  capability: MetadataUiCapabilityKey,
  subject: MetadataUiPermissionSubject,
): boolean {
  if (subject.hasCapability) {
    return subject.hasCapability(capability);
  }

  return createMetadataUiCapabilitySet(subject.capabilities).has(capability);
}

function resolveMetadataUiPermissionRequirement(
  requirement: MetadataUiPermissionRequirement,
  subject: MetadataUiPermissionSubject,
): MetadataUiPermissionRequirementResolution {
  const granted = hasMetadataUiCapability(requirement.capability, subject);

  return {
    requirement,
    granted,
    satisfied: requirement.effect === "allow" ? granted : !granted,
  };
}

export function resolveMetadataUiPermission(
  permission: MetadataUiPermissionContractInput | MetadataUiPermissionContract | undefined,
  subject: MetadataUiPermissionSubject = {},
): MetadataUiPermissionResolution {
  if (!permission) {
    return {
      state: "unrestricted",
      allowed: true,
      visibility: "visible",
      failure: {
        visibility: "hidden",
      },
      operator: "all",
      requirements: [],
      satisfiedRequirements: [],
      failedRequirements: [],
    };
  }

  const contract = parseMetadataUiPermissionContract(permission);
  const requirements = contract.requirements.map((requirement) =>
    resolveMetadataUiPermissionRequirement(requirement, subject),
  );
  const allowed =
    contract.operator === "all"
      ? requirements.every((requirement) => requirement.satisfied)
      : requirements.some((requirement) => requirement.satisfied);
  const satisfiedRequirements = requirements.filter(
    (requirement) => requirement.satisfied,
  );
  const failedRequirements = requirements.filter(
    (requirement) => !requirement.satisfied,
  );

  return {
    state: allowed ? "allowed" : "denied",
    allowed,
    visibility: allowed ? "visible" : contract.failure.visibility,
    failure: contract.failure,
    operator: contract.operator,
    requirements,
    satisfiedRequirements,
    failedRequirements,
  };
}
