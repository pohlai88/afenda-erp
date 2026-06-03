import {
  HrGeoCommandError,
  registerHrGeoDevice,
  updateHrGeoDeviceStatus,
  upsertHrGeoCheckinPolicy,
  upsertHrGeoEligibilityRule,
  upsertHrGeoGeofence,
} from "@afenda/db";

import type {
  RegisterHrGeoDeviceInput,
  UpdateHrGeoDeviceStatusInput,
  UpsertHrGeoCheckinPolicyInput,
  UpsertHrGeoEligibilityRuleInput,
  UpsertHrGeoGeofenceInput,
} from "./hr.time.geo-admin.schema";

export { HrGeoCommandError };

/** HRM-GEO-004/005 — approved geofence maintenance. */
export async function upsertHrGeoGeofenceCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpsertHrGeoGeofenceInput;
}) {
  return upsertHrGeoGeofence({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    geofenceId: input.payload.geofenceId,
    policyGroupCode: input.payload.policyGroupCode,
    label: input.payload.label,
    geofenceKind: input.payload.geofenceKind,
    latitude: input.payload.latitude,
    longitude: input.payload.longitude,
    radiusMeters: input.payload.radiusMeters,
    projectSiteRef: input.payload.projectSiteRef,
    clientSiteRef: input.payload.clientSiteRef,
    employeeId: input.payload.employeeId,
    active: input.payload.active,
  });
}

/** HRM-GEO-008 — remote check-in policy maintenance. */
export async function upsertHrGeoCheckinPolicyCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpsertHrGeoCheckinPolicyInput;
}) {
  return upsertHrGeoCheckinPolicy({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    policyGroupCode: input.payload.policyGroupCode,
    label: input.payload.label,
    policyDetails: input.payload.policyDetails,
    active: input.payload.active,
  });
}

/** HRM-GEO-009 — scoped eligibility rule maintenance. */
export async function upsertHrGeoEligibilityRuleCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpsertHrGeoEligibilityRuleInput;
}) {
  return upsertHrGeoEligibilityRule({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    ruleId: input.payload.ruleId,
    policyGroupCode: input.payload.policyGroupCode,
    legalEntityCode: input.payload.legalEntityCode,
    countryCode: input.payload.countryCode,
    workLocationCode: input.payload.workLocationCode,
    departmentId: input.payload.departmentId,
    roleCode: input.payload.roleCode,
    grade: input.payload.grade,
    employmentType: input.payload.employmentType,
    employeeCategory: input.payload.employeeCategory,
    eligible: input.payload.eligible,
    requiresExceptionApproval: input.payload.requiresExceptionApproval,
    effectiveFrom: input.payload.effectiveFrom
      ? new Date(input.payload.effectiveFrom)
      : undefined,
    effectiveTo:
      input.payload.effectiveTo === undefined
        ? undefined
        : input.payload.effectiveTo === null
          ? null
          : new Date(input.payload.effectiveTo),
  });
}

/** HRM-GEO-010 — register employee device for verification. */
export async function registerHrGeoDeviceCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: RegisterHrGeoDeviceInput;
}) {
  return registerHrGeoDevice({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    employeeId: input.payload.employeeId,
    deviceFingerprint: input.payload.deviceFingerprint,
    deviceLabel: input.payload.deviceLabel,
    platform: input.payload.platform,
  });
}

/** HRM-GEO-010/011 — suspend or revoke registered device. */
export async function updateHrGeoDeviceStatusCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpdateHrGeoDeviceStatusInput;
}) {
  return updateHrGeoDeviceStatus({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    deviceId: input.payload.deviceId,
    status: input.payload.status,
  });
}
