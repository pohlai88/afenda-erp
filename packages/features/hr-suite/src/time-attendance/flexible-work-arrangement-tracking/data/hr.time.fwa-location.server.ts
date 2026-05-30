import {
  listHrFwaRemoteLocations,
  upsertHrFwaRemoteLocation,
} from "@afenda/db";

import type { z } from "zod";

import {
  hrFwaRemoteLocationKindSchema,
  type HrFwaLocationRestrictionInput,
} from "../schemas/hr.time.fwa-location.schema";

export type HrFwaRemoteLocationKind = z.infer<typeof hrFwaRemoteLocationKindSchema>;

export function assertHrFwaLocationRestrictions(input: {
  countryCode?: string | null;
  regionCode?: string | null;
  locationKind: HrFwaRemoteLocationKind;
  restrictions?: HrFwaLocationRestrictionInput;
}): void {
  const restrictions = input.restrictions;
  if (!restrictions) {
    return;
  }

  const country = input.countryCode?.trim().toUpperCase() ?? null;
  const region = input.regionCode?.trim().toUpperCase() ?? null;

  if (
    restrictions.allowedLocationKinds?.length &&
    !restrictions.allowedLocationKinds.includes(input.locationKind)
  ) {
    throw new Error(
      `fwa_location_restriction:Location kind "${input.locationKind}" is not allowed.`,
    );
  }

  if (
    country &&
    restrictions.blockedCountryCodes?.some(
      (code) => code.trim().toUpperCase() === country,
    )
  ) {
    throw new Error(
      `fwa_location_restriction:Country "${country}" is blocked for remote work.`,
    );
  }

  if (
    region &&
    restrictions.blockedRegionCodes?.some(
      (code) => code.trim().toUpperCase() === region,
    )
  ) {
    throw new Error(
      `fwa_location_restriction:Region "${region}" is blocked for remote work.`,
    );
  }

  if (
    country &&
    restrictions.allowedCountryCodes?.length &&
    !restrictions.allowedCountryCodes.some(
      (code) => code.trim().toUpperCase() === country,
    )
  ) {
    throw new Error(
      `fwa_location_restriction:Country "${country}" is not in the approved country list.`,
    );
  }

  if (
    region &&
    restrictions.allowedRegionCodes?.length &&
    !restrictions.allowedRegionCodes.some(
      (code) => code.trim().toUpperCase() === region,
    )
  ) {
    throw new Error(
      `fwa_location_restriction:Region "${region}" is not in the approved region list.`,
    );
  }
}

export async function upsertHrFwaApprovedRemoteLocation(input: {
  organizationId: string;
  employeeId: string;
  label: string;
  locationKind?: HrFwaRemoteLocationKind;
  countryCode?: string | null;
  regionCode?: string | null;
  addressLine?: string | null;
  isApproved?: boolean;
  approvedByAuthUserId?: string | null;
  restrictionNotes?: string | null;
  remoteLocationId?: string;
  restrictions?: HrFwaLocationRestrictionInput;
}): Promise<{ remoteLocationId: string }> {
  const locationKind = input.locationKind ?? "home_office";

  assertHrFwaLocationRestrictions({
    countryCode: input.countryCode,
    regionCode: input.regionCode,
    locationKind,
    restrictions: input.restrictions,
  });

  return upsertHrFwaRemoteLocation({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    label: input.label,
    locationKind,
    countryCode: input.countryCode,
    regionCode: input.regionCode,
    addressLine: input.addressLine,
    isApproved: input.isApproved,
    approvedByAuthUserId: input.approvedByAuthUserId,
    restrictionNotes: input.restrictionNotes,
    remoteLocationId: input.remoteLocationId,
  });
}

export async function listHrFwaEmployeeRemoteLocations(input: {
  organizationId: string;
  employeeId: string;
  approvedOnly?: boolean;
}) {
  return listHrFwaRemoteLocations(input);
}

export const HR_FWA_LOCATION_KIND_LABELS: Record<HrFwaRemoteLocationKind, string> = {
  home_office: "Home office",
  client_site: "Client site",
  branch: "Branch office",
  project_site: "Project site",
  other: "Other",
};
