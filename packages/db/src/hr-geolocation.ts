import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { clampPageSize } from "./list-window.shared";
import {
  hrAttendanceRecords,
  hrDepartments,
  hrEmployees,
  hrPositions,
} from "./hr";
import {
  hrGeoAuditEvents,
  hrGeoCheckinOutcomes,
  hrGeoCheckinPolicies,
  hrGeoEligibilityRules,
  hrGeoGeofences,
  hrGeoNotifications,
  hrGeoRawCheckins,
  hrGeoRegisteredDevices,
  type HrGeoCheckinPolicyDetails,
  type HrGeoSpoofingSignals,
} from "./dbx-hr-geolocation";

export type HrGeoCheckinAction =
  (typeof hrGeoRawCheckins.$inferSelect)["action"];
export type HrGeoValidationFlag =
  (typeof hrGeoRawCheckins.$inferSelect)["validationFlags"][number];
export type HrGeoGeofenceKind =
  (typeof hrGeoGeofences.$inferSelect)["geofenceKind"];

export type HrGeoEligibilityRuleRow = {
  id: string;
  policyGroupCode: string;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  roleCode: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
  eligible: boolean;
  requiresExceptionApproval: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrGeoEligibilityResult = {
  eligible: boolean;
  requiresExceptionApproval: boolean;
  matchedRuleId: string | null;
  reason: string;
};

export type HrGeoGeofenceRow = {
  id: string;
  label: string;
  geofenceKind: HrGeoGeofenceKind;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  projectSiteRef: string | null;
  clientSiteRef: string | null;
  employeeId: string | null;
  policyGroupCode: string;
  active: boolean;
};

export type HrGeoVerifiedRemoteCheckinDay = {
  workDate: Date;
  checkinCount: number;
  verified: boolean;
  locationApproved: boolean;
};

export class HrGeoCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "policy_not_found"
    | "geofence_not_found"
    | "duplicate_idempotency"
    | "not_eligible"
    | "device_not_registered";

  constructor(code: HrGeoCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const EARTH_RADIUS_METERS = 6_371_000;

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function haversineDistanceMeters(input: {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(input.toLat - input.fromLat);
  const dLng = toRad(input.toLng - input.fromLng);
  const lat1 = toRad(input.fromLat);
  const lat2 = toRad(input.toLat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function ruleSpecificityScore(rule: HrGeoEligibilityRuleRow): number {
  let score = 0;
  if (rule.legalEntityCode) score += 4;
  if (rule.countryCode) score += 8;
  if (rule.workLocationCode) score += 16;
  if (rule.roleCode) score += 64;
  if (rule.departmentId) score += 128;
  if (rule.grade) score += 256;
  if (rule.employmentType) score += 512;
  if (rule.employeeCategory) score += 1024;
  return score;
}

export function matchesGeoEligibilityRule(
  rule: HrGeoEligibilityRuleRow,
  context: {
    legalEntityCode: string | null;
    countryCode: string | null;
    workLocationCode: string | null;
    departmentId: string | null;
    roleCode: string | null;
    grade: string | null;
    employmentType: string | null;
    employeeCategory: string | null;
    asOf: Date;
  },
): boolean {
  if (rule.effectiveFrom.getTime() > context.asOf.getTime()) return false;
  if (rule.effectiveTo && rule.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (rule.legalEntityCode && rule.legalEntityCode !== context.legalEntityCode) {
    return false;
  }
  if (rule.countryCode && rule.countryCode !== context.countryCode) return false;
  if (
    rule.workLocationCode &&
    rule.workLocationCode !== context.workLocationCode
  ) {
    return false;
  }
  if (rule.departmentId && rule.departmentId !== context.departmentId) {
    return false;
  }
  if (rule.roleCode && rule.roleCode !== context.roleCode) return false;
  if (rule.grade && rule.grade !== context.grade) return false;
  if (rule.employmentType && rule.employmentType !== context.employmentType) {
    return false;
  }
  if (
    rule.employeeCategory &&
    rule.employeeCategory !== context.employeeCategory
  ) {
    return false;
  }
  return true;
}

export function resolveGeoEligibilityFromRules(input: {
  rules: readonly HrGeoEligibilityRuleRow[];
  context: {
    legalEntityCode: string | null;
    countryCode: string | null;
    workLocationCode: string | null;
    departmentId: string | null;
    roleCode: string | null;
    grade: string | null;
    employmentType: string | null;
    employeeCategory: string | null;
    asOf: Date;
  };
}): HrGeoEligibilityResult {
  const matching = input.rules
    .filter((rule) => matchesGeoEligibilityRule(rule, input.context))
    .sort((a, b) => ruleSpecificityScore(b) - ruleSpecificityScore(a));

  const best = matching[0];
  if (!best) {
    return {
      eligible: false,
      requiresExceptionApproval: true,
      matchedRuleId: null,
      reason: "No matching eligibility rule",
    };
  }

  if (!best.eligible) {
    return {
      eligible: false,
      requiresExceptionApproval: best.requiresExceptionApproval,
      matchedRuleId: best.id,
      reason: "Employee matched an ineligible rule",
    };
  }

  return {
    eligible: true,
    requiresExceptionApproval: best.requiresExceptionApproval,
    matchedRuleId: best.id,
    reason: "Employee matched eligible rule",
  };
}

export function mergeHrGeoSpoofingSignals(
  clientSignals: HrGeoSpoofingSignals | undefined,
  serverSignals: HrGeoSpoofingSignals,
): HrGeoSpoofingSignals {
  return {
    ...clientSignals,
    ...serverSignals,
    clientFlags: [
      ...(clientSignals?.clientFlags ?? []),
      ...(serverSignals.clientFlags ?? []),
    ],
  };
}

export function collectHrGeoServerSpoofingSignals(input: {
  accuracyMeters: number | null;
  capturedAt: Date;
  serverNow: Date;
  previousCheckin?: { latitude: number; longitude: number; capturedAt: Date };
  currentLat: number;
  currentLng: number;
}): HrGeoSpoofingSignals {
  const signals: HrGeoSpoofingSignals = {};
  if (input.accuracyMeters !== null && input.accuracyMeters <= 1) {
    signals.accuracyTooGood = true;
  }
  const driftSeconds = Math.abs(
    (input.serverNow.getTime() - input.capturedAt.getTime()) / 1000,
  );
  if (driftSeconds > 120) {
    signals.timestampDriftSeconds = driftSeconds;
  }
  if (input.previousCheckin) {
    const elapsedHours =
      (input.capturedAt.getTime() - input.previousCheckin.capturedAt.getTime()) /
      3_600_000;
    if (elapsedHours > 0) {
      const distanceKm =
        haversineDistanceMeters({
          fromLat: input.previousCheckin.latitude,
          fromLng: input.previousCheckin.longitude,
          toLat: input.currentLat,
          toLng: input.currentLng,
        }) / 1000;
      const velocityKmh = distanceKm / elapsedHours;
      if (velocityKmh > 900) {
        signals.impossibleVelocityKmh = velocityKmh;
      }
    }
  }
  return signals;
}

export function hasHrGeoSpoofingRisk(signals: HrGeoSpoofingSignals): boolean {
  return Boolean(
    signals.mockProvider ||
      signals.accuracyTooGood ||
      (signals.timestampDriftSeconds ?? 0) > 120 ||
      (signals.impossibleVelocityKmh ?? 0) > 900,
  );
}

export function maskHrGeoCoordinates(input: {
  latitude: number;
  longitude: number;
  precisionDecimals?: number;
}): { latitude: number; longitude: number } {
  const precision = input.precisionDecimals ?? 2;
  const factor = 10 ** precision;
  return {
    latitude: Math.round(input.latitude * factor) / factor,
    longitude: Math.round(input.longitude * factor) / factor,
  };
}

async function loadEmployeeGeoContext(
  organizationId: string,
  employeeId: string,
) {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        legalEntityCode: hrEmployees.legalEntityCode,
        countryCode: hrEmployees.countryCode,
        workLocationCode: hrEmployees.workLocationCode,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        grade: hrEmployees.grade,
        employmentType: hrEmployees.employmentType,
        workerCategory: hrEmployees.workerCategory,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrGeoCommandError("employee_not_found");
    }

    let roleCode: string | null = null;
    if (employee.currentPositionId) {
      const [position] = await db
        .select({ code: hrPositions.code })
        .from(hrPositions)
        .where(eq(hrPositions.id, employee.currentPositionId))
        .limit(1);
      roleCode = position?.code ?? null;
    }

    return { ...employee, roleCode };
  });
}

export async function listHrGeoEligibilityRules(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<readonly HrGeoEligibilityRuleRow[]> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(hrGeoEligibilityRules)
      .where(
        and(
          eq(hrGeoEligibilityRules.organizationId, input.organizationId),
          eq(hrGeoEligibilityRules.policyGroupCode, policyGroupCode),
        ),
      );
    return rows;
  });
}

export async function evaluateHrGeoEmployeeEligibility(input: {
  organizationId: string;
  employeeId: string;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<HrGeoEligibilityResult> {
  const employee = await loadEmployeeGeoContext(
    input.organizationId,
    input.employeeId,
  );
  const rules = await listHrGeoEligibilityRules({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  return resolveGeoEligibilityFromRules({
    rules,
    context: {
      legalEntityCode: employee.legalEntityCode,
      countryCode: employee.countryCode,
      workLocationCode: employee.workLocationCode,
      departmentId: employee.currentDepartmentId,
      roleCode: employee.roleCode,
      grade: employee.grade,
      employmentType: employee.employmentType,
      employeeCategory: employee.workerCategory,
      asOf: input.asOf ?? new Date(),
    },
  });
}

export async function getHrGeoCheckinPolicy(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<{
  id: string;
  policyGroupCode: string;
  policyDetails: HrGeoCheckinPolicyDetails;
}> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrGeoCheckinPolicies)
      .where(
        and(
          eq(hrGeoCheckinPolicies.organizationId, input.organizationId),
          eq(hrGeoCheckinPolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrGeoCommandError("policy_not_found");
    }

    return {
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      policyDetails: row.policyDetails,
    };
  });
}

export async function listHrGeoGeofences(input: {
  organizationId: string;
  policyGroupCode?: string;
  employeeId?: string;
  activeOnly?: boolean;
}): Promise<readonly HrGeoGeofenceRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoGeofences.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrGeoGeofences.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.activeOnly !== false) {
      conditions.push(eq(hrGeoGeofences.active, true));
    }
    if (input.employeeId) {
      conditions.push(
        or(
          isNull(hrGeoGeofences.employeeId),
          eq(hrGeoGeofences.employeeId, input.employeeId),
        )!,
      );
    }

    const rows = await db
      .select()
      .from(hrGeoGeofences)
      .where(and(...conditions));

    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      geofenceKind: row.geofenceKind,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      radiusMeters: row.radiusMeters,
      projectSiteRef: row.projectSiteRef,
      clientSiteRef: row.clientSiteRef,
      employeeId: row.employeeId,
      policyGroupCode: row.policyGroupCode,
      active: row.active,
    }));
  });
}

export function findMatchingHrGeoGeofence(input: {
  geofences: readonly HrGeoGeofenceRow[];
  latitude: number;
  longitude: number;
}): { geofence: HrGeoGeofenceRow; distanceMeters: number } | null {
  let best: { geofence: HrGeoGeofenceRow; distanceMeters: number } | null = null;

  for (const geofence of input.geofences) {
    const distanceMeters = haversineDistanceMeters({
      fromLat: input.latitude,
      fromLng: input.longitude,
      toLat: geofence.latitude,
      toLng: geofence.longitude,
    });
    if (distanceMeters <= geofence.radiusMeters) {
      if (!best || distanceMeters < best.distanceMeters) {
        best = { geofence, distanceMeters };
      }
    }
  }

  return best;
}

export function isWithinHrGeoTimeWindow(input: {
  capturedAt: Date;
  policy: HrGeoCheckinPolicyDetails;
}): boolean {
  const minutes =
    input.capturedAt.getUTCHours() * 60 + input.capturedAt.getUTCMinutes();
  return (
    minutes >= input.policy.allowedWindowStartMinutes &&
    minutes <= input.policy.allowedWindowEndMinutes
  );
}

export async function isHrGeoDeviceRegistered(input: {
  organizationId: string;
  employeeId: string;
  deviceFingerprint: string;
}): Promise<boolean> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({ id: hrGeoRegisteredDevices.id })
      .from(hrGeoRegisteredDevices)
      .where(
        and(
          eq(hrGeoRegisteredDevices.organizationId, input.organizationId),
          eq(hrGeoRegisteredDevices.employeeId, input.employeeId),
          eq(hrGeoRegisteredDevices.deviceFingerprint, input.deviceFingerprint),
          eq(hrGeoRegisteredDevices.status, "registered"),
        ),
      )
      .limit(1);
    return Boolean(row);
  });
}

export async function appendHrGeoAuditEvent(input: {
  organizationId: string;
  action: (typeof hrGeoAuditEvents.$inferSelect)["action"];
  auditKey: string;
  actorAuthUserId?: string | null;
  employeeId?: string | null;
  rawCheckinId?: string | null;
  outcomeId?: string | null;
  exceptionId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_geo_audit");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrGeoAuditEvents).values({
      id: auditEventId,
      organizationId: input.organizationId,
      action: input.action,
      auditKey: input.auditKey,
      actorAuthUserId: input.actorAuthUserId ?? null,
      employeeId: input.employeeId ?? null,
      rawCheckinId: input.rawCheckinId ?? null,
      outcomeId: input.outcomeId ?? null,
      exceptionId: input.exceptionId ?? null,
      metadata: input.metadata ?? {},
    });
  });
  return { auditEventId };
}

export async function enqueueHrGeoNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrGeoNotifications.$inferSelect)["kind"];
  subjectKind: string;
  subjectId: string;
  title: string;
  body: string;
}): Promise<{ notificationId: string }> {
  const notificationId = createEntityId("hr_geo_notif");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrGeoNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectKind: input.subjectKind,
      subjectId: input.subjectId,
      title: input.title,
      body: input.body,
    });
  });
  return { notificationId };
}

export async function captureHrGeoRemoteCheckin(input: {
  organizationId: string;
  employeeId: string;
  actorAuthUserId: string;
  action: HrGeoCheckinAction;
  capturedAt: Date;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  deviceFingerprint?: string | null;
  deviceReference?: string | null;
  projectSiteRef?: string | null;
  clientSiteRef?: string | null;
  selfieBlobUrl?: string | null;
  clientSpoofingSignals?: HrGeoSpoofingSignals;
  clientMetadata?: Record<string, unknown>;
  idempotencyKey?: string | null;
  policyGroupCode?: string;
}): Promise<{
  rawCheckinId: string;
  outcomeId: string;
  validationFlags: HrGeoValidationFlag[];
  status: (typeof hrGeoCheckinOutcomes.$inferSelect)["status"];
  matchedGeofenceId: string | null;
}> {
  if (input.idempotencyKey) {
    const idempotencyKey = input.idempotencyKey;
    const existing = await runWithOrganizationContext(
      input.organizationId,
      async (db) => {
        const [row] = await db
          .select({ id: hrGeoRawCheckins.id })
          .from(hrGeoRawCheckins)
          .where(
            and(
              eq(hrGeoRawCheckins.organizationId, input.organizationId),
              eq(hrGeoRawCheckins.idempotencyKey, idempotencyKey),
            ),
          )
          .limit(1);
        return row?.id ?? null;
      },
    );
    if (existing) {
      throw new HrGeoCommandError("duplicate_idempotency");
    }
  }

  const [policy, eligibility, geofences] = await Promise.all([
    getHrGeoCheckinPolicy({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode,
    }),
    evaluateHrGeoEmployeeEligibility({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      policyGroupCode: input.policyGroupCode,
    }),
    listHrGeoGeofences({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode,
      employeeId: input.employeeId,
    }),
  ]);

  const validationFlags: HrGeoValidationFlag[] = [];
  const lat = input.latitude ?? null;
  const lng = input.longitude ?? null;
  const accuracy =
    input.accuracyMeters === undefined || input.accuracyMeters === null
      ? null
      : Number(input.accuracyMeters);

  if (lat === null || lng === null) {
    validationFlags.push("missing_gps");
  }

  if (!eligibility.eligible) {
    validationFlags.push("not_eligible");
  }

  if (
    input.deviceFingerprint &&
    policy.policyDetails.requireRegisteredDevice
  ) {
    const registered = await isHrGeoDeviceRegistered({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      deviceFingerprint: input.deviceFingerprint,
    });
    if (!registered) {
      validationFlags.push("unregistered_device");
    }
  } else if (
    input.deviceFingerprint &&
    !(await isHrGeoDeviceRegistered({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      deviceFingerprint: input.deviceFingerprint,
    }))
  ) {
    validationFlags.push("suspicious_device");
  }

  if (
    accuracy !== null &&
    accuracy > policy.policyDetails.weakGpsAccuracyMeters
  ) {
    validationFlags.push("weak_gps");
  }

  if (!isWithinHrGeoTimeWindow({ capturedAt: input.capturedAt, policy: policy.policyDetails })) {
    validationFlags.push("outside_time_window");
  }

  let matchedGeofenceId: string | null = null;
  if (lat !== null && lng !== null) {
    const match = findMatchingHrGeoGeofence({
      geofences,
      latitude: lat,
      longitude: lng,
    });
    if (match) {
      matchedGeofenceId = match.geofence.id;
    } else {
      validationFlags.push("outside_geofence");
    }
  }

  const previousCheckin =
    lat !== null && lng !== null
      ? await runWithOrganizationContext(input.organizationId, async (db) => {
          const [row] = await db
            .select({
              latitude: hrGeoRawCheckins.latitude,
              longitude: hrGeoRawCheckins.longitude,
              capturedAt: hrGeoRawCheckins.capturedAt,
            })
            .from(hrGeoRawCheckins)
            .where(
              and(
                eq(hrGeoRawCheckins.organizationId, input.organizationId),
                eq(hrGeoRawCheckins.employeeId, input.employeeId),
              ),
            )
            .orderBy(desc(hrGeoRawCheckins.capturedAt))
            .limit(1);
          if (!row?.latitude || !row.longitude) return undefined;
          return {
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            capturedAt: row.capturedAt,
          };
        })
      : undefined;

  const serverSpoofing = collectHrGeoServerSpoofingSignals({
    accuracyMeters: accuracy,
    capturedAt: input.capturedAt,
    serverNow: new Date(),
    previousCheckin,
    currentLat: lat ?? 0,
    currentLng: lng ?? 0,
  });
  const spoofingSignals = mergeHrGeoSpoofingSignals(
    input.clientSpoofingSignals,
    serverSpoofing,
  );

  if (
    policy.policyDetails.detectSpoofing &&
    hasHrGeoSpoofingRisk(spoofingSignals)
  ) {
    validationFlags.push("spoofing_risk");
  }

  if (
    policy.policyDetails.requireSelfie &&
    !input.selfieBlobUrl?.trim()
  ) {
    validationFlags.push("inaccurate_gps");
  }

  const rawCheckinId = createEntityId("hr_geo_raw");
  const outcomeId = createEntityId("hr_geo_outcome");
  const workDate = startOfUtcDay(input.capturedAt);
  const status =
    validationFlags.length === 0 ? ("verified" as const) : ("pending_review" as const);

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrGeoRawCheckins).values({
      id: rawCheckinId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      action: input.action,
      capturedAt: input.capturedAt,
      latitude: lat === null ? null : String(lat),
      longitude: lng === null ? null : String(lng),
      accuracyMeters: accuracy === null ? null : String(accuracy),
      deviceFingerprint: input.deviceFingerprint ?? null,
      deviceReference: input.deviceReference ?? null,
      geofenceId: matchedGeofenceId,
      projectSiteRef: input.projectSiteRef ?? null,
      clientSiteRef: input.clientSiteRef ?? null,
      selfieBlobUrl: input.selfieBlobUrl ?? null,
      validationFlags,
      spoofingSignals,
      clientMetadata: input.clientMetadata ?? {},
      idempotencyKey: input.idempotencyKey ?? null,
    });

    await db.insert(hrGeoCheckinOutcomes).values({
      id: outcomeId,
      organizationId: input.organizationId,
      rawCheckinId,
      employeeId: input.employeeId,
      workDate,
      action: input.action,
      status,
      geofenceId: matchedGeofenceId,
      verifiedAt: status === "verified" ? input.capturedAt : null,
    });
  });

  await appendHrGeoAuditEvent({
    organizationId: input.organizationId,
    action: "checkin_captured",
    auditKey: "erp.hrm.geo.checkin.captured",
    actorAuthUserId: input.actorAuthUserId,
    employeeId: input.employeeId,
    rawCheckinId,
    outcomeId,
    metadata: { validationFlags, action: input.action },
  });

  if (status === "verified") {
    await publishHrGeoOutcomeToLam({
      organizationId: input.organizationId,
      outcomeId,
      employeeId: input.employeeId,
      action: input.action,
      capturedAt: input.capturedAt,
      actorAuthUserId: input.actorAuthUserId,
    });
  }

  return {
    rawCheckinId,
    outcomeId,
    validationFlags,
    status,
    matchedGeofenceId,
  };
}

export async function publishHrGeoOutcomeToLam(input: {
  organizationId: string;
  outcomeId: string;
  employeeId: string;
  action: HrGeoCheckinAction;
  capturedAt: Date;
  actorAuthUserId: string;
}): Promise<{ lamAttendanceRecordId: string | null }> {
  if (input.action !== "check_in" && input.action !== "check_out") {
    return { lamAttendanceRecordId: null };
  }

  const punchType = input.action === "check_in" ? "clock_in" : "clock_out";
  const lamAttendanceRecordId = createEntityId("hr_att_rec");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrAttendanceRecords).values({
      id: lamAttendanceRecordId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      punchType,
      source: "mobile",
      punchedAt: input.capturedAt,
      notes: `geo:${input.outcomeId}`,
    });

    await db
      .update(hrGeoCheckinOutcomes)
      .set({ lamAttendanceRecordId })
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.id, input.outcomeId),
        ),
      );
  });

  await appendHrGeoAuditEvent({
    organizationId: input.organizationId,
    action: "lam_reference_published",
    auditKey: "erp.hrm.geo.lam.published",
    actorAuthUserId: input.actorAuthUserId,
    employeeId: input.employeeId,
    outcomeId: input.outcomeId,
    metadata: { lamAttendanceRecordId },
  });

  return { lamAttendanceRecordId };
}

/** HRM-GEO-024 — FWA/LAM boundary for verified remote check-in days. */
export async function listVerifiedRemoteCheckinDaysForEmployee(input: {
  organizationId: string;
  employeeId: string;
  workDateFrom: Date;
  workDateTo: Date;
}): Promise<readonly HrGeoVerifiedRemoteCheckinDay[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        workDate: hrGeoCheckinOutcomes.workDate,
        status: hrGeoCheckinOutcomes.status,
        geofenceId: hrGeoCheckinOutcomes.geofenceId,
      })
      .from(hrGeoCheckinOutcomes)
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.employeeId, input.employeeId),
          gte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateFrom)),
          lte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateTo)),
          eq(hrGeoCheckinOutcomes.action, "check_in"),
        ),
      );

    const byDate = new Map<string, HrGeoVerifiedRemoteCheckinDay>();
    for (const row of rows) {
      const key = startOfUtcDay(row.workDate).toISOString();
      const existing = byDate.get(key) ?? {
        workDate: startOfUtcDay(row.workDate),
        checkinCount: 0,
        verified: false,
        locationApproved: false,
      };
      existing.checkinCount += 1;
      if (row.status === "verified" || row.status === "corrected") {
        existing.verified = true;
      }
      if (row.geofenceId) {
        existing.locationApproved = true;
      }
      byDate.set(key, existing);
    }

    return [...byDate.values()];
  });
}

export type HrGeoGeofenceWindow = {
  rows: Array<
    HrGeoGeofenceRow & {
      employeeNumber: string | null;
      employeeDisplayName: string | null;
    }
  >;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrGeoGeofencesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrGeoGeofenceWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoGeofences.organizationId, input.organizationId),
      eq(hrGeoGeofences.active, true),
    ];

    if (input.visibleEmployeeIds) {
      conditions.push(
        or(
          isNull(hrGeoGeofences.employeeId),
          sql`${hrGeoGeofences.employeeId} = ANY(${input.visibleEmployeeIds})`,
        )!,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrGeoGeofences.label, pattern),
          ilike(hrGeoGeofences.projectSiteRef, pattern),
          ilike(hrGeoGeofences.clientSiteRef, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoGeofences)
      .leftJoin(hrEmployees, eq(hrGeoGeofences.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoGeofences.id,
        label: hrGeoGeofences.label,
        geofenceKind: hrGeoGeofences.geofenceKind,
        latitude: hrGeoGeofences.latitude,
        longitude: hrGeoGeofences.longitude,
        radiusMeters: hrGeoGeofences.radiusMeters,
        projectSiteRef: hrGeoGeofences.projectSiteRef,
        clientSiteRef: hrGeoGeofences.clientSiteRef,
        employeeId: hrGeoGeofences.employeeId,
        policyGroupCode: hrGeoGeofences.policyGroupCode,
        active: hrGeoGeofences.active,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrGeoGeofences)
      .leftJoin(hrEmployees, eq(hrGeoGeofences.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrGeoGeofences.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        label: row.label,
        geofenceKind: row.geofenceKind,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        radiusMeters: row.radiusMeters,
        projectSiteRef: row.projectSiteRef,
        clientSiteRef: row.clientSiteRef,
        employeeId: row.employeeId,
        policyGroupCode: row.policyGroupCode,
        active: row.active,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export type HrGeoHistoryWindow = {
  rows: Array<{
    id: string;
    employeeId: string;
    employeeNumber: string;
    employeeDisplayName: string;
    action: HrGeoCheckinAction;
    capturedAt: Date;
    status: (typeof hrGeoCheckinOutcomes.$inferSelect)["status"];
    validationFlags: HrGeoValidationFlag[];
    geofenceLabel: string | null;
    maskedLatitude: string | null;
    maskedLongitude: string | null;
  }>;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrGeoHistoryWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
  canViewDetailedLocation?: boolean;
}): Promise<HrGeoHistoryWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrGeoRawCheckins.organizationId, input.organizationId)];

    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoRawCheckins.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoRawCheckins)
      .innerJoin(hrEmployees, eq(hrGeoRawCheckins.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoRawCheckins.id,
        employeeId: hrGeoRawCheckins.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        action: hrGeoRawCheckins.action,
        capturedAt: hrGeoRawCheckins.capturedAt,
        latitude: hrGeoRawCheckins.latitude,
        longitude: hrGeoRawCheckins.longitude,
        validationFlags: hrGeoRawCheckins.validationFlags,
        geofenceLabel: hrGeoGeofences.label,
        outcomeStatus: hrGeoCheckinOutcomes.status,
      })
      .from(hrGeoRawCheckins)
      .innerJoin(hrEmployees, eq(hrGeoRawCheckins.employeeId, hrEmployees.id))
      .leftJoin(
        hrGeoCheckinOutcomes,
        eq(hrGeoCheckinOutcomes.rawCheckinId, hrGeoRawCheckins.id),
      )
      .leftJoin(
        hrGeoGeofences,
        eq(hrGeoRawCheckins.geofenceId, hrGeoGeofences.id),
      )
      .where(whereClause)
      .orderBy(desc(hrGeoRawCheckins.capturedAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => {
        const lat = row.latitude ? Number(row.latitude) : null;
        const lng = row.longitude ? Number(row.longitude) : null;
        const masked =
          lat !== null && lng !== null
            ? input.canViewDetailedLocation
              ? { latitude: lat, longitude: lng }
              : maskHrGeoCoordinates({ latitude: lat, longitude: lng })
            : null;

        return {
          id: row.id,
          employeeId: row.employeeId,
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.preferredName ?? row.legalName,
          action: row.action,
          capturedAt: row.capturedAt,
          status: row.outcomeStatus ?? "pending_review",
          validationFlags: row.validationFlags,
          geofenceLabel: row.geofenceLabel,
          maskedLatitude: masked ? String(masked.latitude) : null,
          maskedLongitude: masked ? String(masked.longitude) : null,
        };
      }),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export async function summarizeHrGeoReport(input: {
  organizationId: string;
  groupBy:
    | "employee"
    | "department"
    | "manager"
    | "location"
    | "site"
    | "exception"
    | "period";
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<
  Array<{
    groupKey: string;
    groupLabel: string;
    verifiedCount: number;
    pendingCount: number;
    exceptionCount: number;
  }>
> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrGeoCheckinOutcomes.organizationId, input.organizationId)];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoCheckinOutcomes.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }

    const rows = await db
      .select({
        employeeId: hrGeoCheckinOutcomes.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        workLocationCode: hrEmployees.workLocationCode,
        status: hrGeoCheckinOutcomes.status,
        workDate: hrGeoCheckinOutcomes.workDate,
        geofenceLabel: hrGeoGeofences.label,
      })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(
        hrGeoGeofences,
        eq(hrGeoCheckinOutcomes.geofenceId, hrGeoGeofences.id),
      )
      .where(and(...conditions));

    const groups = new Map<
      string,
      { groupLabel: string; verifiedCount: number; pendingCount: number; exceptionCount: number }
    >();

    for (const row of rows) {
      let groupKey = row.employeeId;
      let groupLabel = row.preferredName ?? row.legalName ?? row.employeeId;

      switch (input.groupBy) {
        case "department":
          groupKey = row.departmentId ?? "unassigned";
          groupLabel = row.departmentName ?? "Unassigned";
          break;
        case "location":
          groupKey = row.workLocationCode ?? "unknown";
          groupLabel = row.workLocationCode ?? "Unknown location";
          break;
        case "site":
          groupKey = row.geofenceLabel ?? "no_site";
          groupLabel = row.geofenceLabel ?? "No site";
          break;
        case "period":
          groupKey = startOfUtcDay(row.workDate).toISOString().slice(0, 10);
          groupLabel = groupKey;
          break;
        case "exception":
          groupKey =
            row.status === "pending_review" ? "pending_review" : row.status;
          groupLabel = groupKey;
          break;
        default:
          break;
      }

      const bucket = groups.get(groupKey) ?? {
        groupLabel,
        verifiedCount: 0,
        pendingCount: 0,
        exceptionCount: 0,
      };

      if (row.status === "verified" || row.status === "corrected") {
        bucket.verifiedCount += 1;
      } else if (row.status === "pending_review") {
        bucket.pendingCount += 1;
        bucket.exceptionCount += 1;
      } else {
        bucket.exceptionCount += 1;
      }

      groups.set(groupKey, bucket);
    }

    return [...groups.entries()].map(([groupKey, value]) => ({
      groupKey,
      ...value,
    }));
  });
}

export async function listHrGeoRegisteredDevicesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoRegisteredDevices.organizationId, input.organizationId),
    ];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoRegisteredDevices.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrGeoRegisteredDevices.deviceFingerprint, pattern),
          ilike(hrGeoRegisteredDevices.deviceLabel, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoRegisteredDevices)
      .innerJoin(hrEmployees, eq(hrGeoRegisteredDevices.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoRegisteredDevices.id,
        employeeId: hrGeoRegisteredDevices.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        deviceFingerprint: hrGeoRegisteredDevices.deviceFingerprint,
        deviceLabel: hrGeoRegisteredDevices.deviceLabel,
        platform: hrGeoRegisteredDevices.platform,
        status: hrGeoRegisteredDevices.status,
        registeredAt: hrGeoRegisteredDevices.registeredAt,
        lastSeenAt: hrGeoRegisteredDevices.lastSeenAt,
      })
      .from(hrGeoRegisteredDevices)
      .innerJoin(hrEmployees, eq(hrGeoRegisteredDevices.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrGeoRegisteredDevices.registeredAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        deviceFingerprint: row.deviceFingerprint,
        deviceLabel: row.deviceLabel,
        platform: row.platform,
        status: row.status,
        registeredAt: row.registeredAt,
        lastSeenAt: row.lastSeenAt,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export async function listHrGeoPoliciesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoCheckinPolicies.organizationId, input.organizationId),
      eq(hrGeoCheckinPolicies.active, true),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrGeoCheckinPolicies.label, pattern),
          ilike(hrGeoCheckinPolicies.policyGroupCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinPolicies)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrGeoCheckinPolicies)
      .where(whereClause)
      .orderBy(desc(hrGeoCheckinPolicies.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        label: row.label,
        policyGroupCode: row.policyGroupCode,
        weakGpsAccuracyMeters: row.policyDetails.weakGpsAccuracyMeters,
        requireRegisteredDevice: row.policyDetails.requireRegisteredDevice,
        detectSpoofing: row.policyDetails.detectSpoofing,
        requireSelfie: row.policyDetails.requireSelfie,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export async function listHrGeoAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrGeoAuditEvents.organizationId, input.organizationId)];

    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoAuditEvents.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrGeoAuditEvents.auditKey, pattern),
          ilike(hrGeoAuditEvents.action, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoAuditEvents)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrGeoAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrGeoAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export async function countHrGeoKpiStats(input: {
  organizationId: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<{
  verifiedToday: number;
  pendingExceptions: number;
  outsideGeofenceFlags: number;
  weakGpsFlags: number;
}> {
  const todayStart = startOfUtcDay(new Date());
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employeeFilter = input.visibleEmployeeIds
      ? sql`${hrGeoCheckinOutcomes.employeeId} = ANY(${input.visibleEmployeeIds})`
      : sql`true`;

    const [verifiedRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinOutcomes)
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          gte(hrGeoCheckinOutcomes.workDate, todayStart),
          lte(hrGeoCheckinOutcomes.workDate, tomorrowStart),
          eq(hrGeoCheckinOutcomes.status, "verified"),
          employeeFilter,
        ),
      );

    const [pendingRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinOutcomes)
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.status, "pending_review"),
          employeeFilter,
        ),
      );

    const [outsideRow] = await db
      .select({ total: count() })
      .from(hrGeoRawCheckins)
      .where(
        and(
          eq(hrGeoRawCheckins.organizationId, input.organizationId),
          sql`${hrGeoRawCheckins.validationFlags} @> ${JSON.stringify(["outside_geofence"])}::jsonb`,
          input.visibleEmployeeIds
            ? sql`${hrGeoRawCheckins.employeeId} = ANY(${input.visibleEmployeeIds})`
            : sql`true`,
        ),
      );

    const [weakRow] = await db
      .select({ total: count() })
      .from(hrGeoRawCheckins)
      .where(
        and(
          eq(hrGeoRawCheckins.organizationId, input.organizationId),
          sql`${hrGeoRawCheckins.validationFlags} @> ${JSON.stringify(["weak_gps"])}::jsonb`,
          input.visibleEmployeeIds
            ? sql`${hrGeoRawCheckins.employeeId} = ANY(${input.visibleEmployeeIds})`
            : sql`true`,
        ),
      );

    return {
      verifiedToday: Number(verifiedRow?.total ?? 0),
      pendingExceptions: Number(pendingRow?.total ?? 0),
      outsideGeofenceFlags: Number(outsideRow?.total ?? 0),
      weakGpsFlags: Number(weakRow?.total ?? 0),
    };
  });
}

export async function listHrGeoOvertimeWorkHourRefs(input: {
  organizationId: string;
  employeeId: string;
  workDateFrom: Date;
  workDateTo: Date;
}): Promise<
  Array<{ workDate: Date; checkInAt: Date | null; checkOutAt: Date | null; verified: boolean }>
> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        workDate: hrGeoCheckinOutcomes.workDate,
        action: hrGeoCheckinOutcomes.action,
        verifiedAt: hrGeoCheckinOutcomes.verifiedAt,
        status: hrGeoCheckinOutcomes.status,
        rawCapturedAt: hrGeoRawCheckins.capturedAt,
      })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(
        hrGeoRawCheckins,
        eq(hrGeoCheckinOutcomes.rawCheckinId, hrGeoRawCheckins.id),
      )
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.employeeId, input.employeeId),
          gte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateFrom)),
          lte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateTo)),
        ),
      );

    const byDate = new Map<
      string,
      { workDate: Date; checkInAt: Date | null; checkOutAt: Date | null; verified: boolean }
    >();

    for (const row of rows) {
      const key = startOfUtcDay(row.workDate).toISOString();
      const bucket = byDate.get(key) ?? {
        workDate: startOfUtcDay(row.workDate),
        checkInAt: null,
        checkOutAt: null,
        verified: false,
      };
      if (row.action === "check_in") bucket.checkInAt = row.rawCapturedAt;
      if (row.action === "check_out") bucket.checkOutAt = row.rawCapturedAt;
      if (row.status === "verified" || row.status === "corrected") {
        bucket.verified = true;
      }
      byDate.set(key, bucket);
    }

    return [...byDate.values()];
  });
}

export async function listHrGeoPayrollAttendanceDayRefs(input: {
  organizationId: string;
  employeeId: string;
  workDateFrom: Date;
  workDateTo: Date;
}): Promise<
  Array<{ workDate: Date; payrollDayReference: string | null; verified: boolean }>
> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        workDate: hrGeoCheckinOutcomes.workDate,
        payrollDayReference: hrGeoCheckinOutcomes.payrollDayReference,
        status: hrGeoCheckinOutcomes.status,
      })
      .from(hrGeoCheckinOutcomes)
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.employeeId, input.employeeId),
          gte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateFrom)),
          lte(hrGeoCheckinOutcomes.workDate, startOfUtcDay(input.workDateTo)),
        ),
      );

    const byDate = new Map<
      string,
      { workDate: Date; payrollDayReference: string | null; verified: boolean }
    >();

    for (const row of rows) {
      const key = startOfUtcDay(row.workDate).toISOString();
      const bucket = byDate.get(key) ?? {
        workDate: startOfUtcDay(row.workDate),
        payrollDayReference: row.payrollDayReference,
        verified: row.status === "verified" || row.status === "corrected",
      };
      if (row.payrollDayReference) {
        bucket.payrollDayReference = row.payrollDayReference;
      }
      byDate.set(key, bucket);
    }

    return [...byDate.values()];
  });
}

const DEFAULT_HR_GEO_CHECKIN_POLICY_DETAILS: HrGeoCheckinPolicyDetails = {
  weakGpsAccuracyMeters: 75,
  allowedWindowStartMinutes: 0,
  allowedWindowEndMinutes: 1440,
  requireRegisteredDevice: false,
  detectSpoofing: true,
  requireSelfie: false,
  allowFieldMultiSite: true,
  maskPrecisionForNonDetailReaders: true,
};

/** HRM-GEO-004/005 — create or update an approved geofence. */
export async function upsertHrGeoGeofence(input: {
  organizationId: string;
  actorAuthUserId: string;
  geofenceId?: string;
  policyGroupCode?: string;
  label: string;
  geofenceKind: HrGeoGeofenceKind;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  projectSiteRef?: string | null;
  clientSiteRef?: string | null;
  employeeId?: string | null;
  active?: boolean;
}): Promise<{ geofenceId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const radiusMeters = Math.max(1, Math.floor(input.radiusMeters ?? 100));
  const active = input.active ?? true;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    if (input.geofenceId) {
      const [existing] = await db
        .select({ id: hrGeoGeofences.id })
        .from(hrGeoGeofences)
        .where(
          and(
            eq(hrGeoGeofences.organizationId, input.organizationId),
            eq(hrGeoGeofences.id, input.geofenceId),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new HrGeoCommandError("geofence_not_found");
      }

      await db
        .update(hrGeoGeofences)
        .set({
          policyGroupCode,
          label: input.label.trim(),
          geofenceKind: input.geofenceKind,
          latitude: String(input.latitude),
          longitude: String(input.longitude),
          radiusMeters,
          projectSiteRef: input.projectSiteRef ?? null,
          clientSiteRef: input.clientSiteRef ?? null,
          employeeId: input.employeeId ?? null,
          active,
        })
        .where(eq(hrGeoGeofences.id, existing.id));

      await appendHrGeoAuditEvent({
        organizationId: input.organizationId,
        action: "geofence_updated",
        auditKey: "erp.hrm.geo.geofence.updated",
        actorAuthUserId: input.actorAuthUserId,
        metadata: { geofenceId: existing.id, policyGroupCode },
      });

      return { geofenceId: existing.id };
    }

    const geofenceId = createEntityId("hr_geo_fence");
    await db.insert(hrGeoGeofences).values({
      id: geofenceId,
      organizationId: input.organizationId,
      policyGroupCode,
      label: input.label.trim(),
      geofenceKind: input.geofenceKind,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      radiusMeters,
      projectSiteRef: input.projectSiteRef ?? null,
      clientSiteRef: input.clientSiteRef ?? null,
      employeeId: input.employeeId ?? null,
      active,
    });

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "geofence_updated",
      auditKey: "erp.hrm.geo.geofence.updated",
      actorAuthUserId: input.actorAuthUserId,
      metadata: { geofenceId, policyGroupCode, created: true },
    });

    return { geofenceId };
  });
}

/** HRM-GEO-008 — create or update remote check-in policy for a policy group. */
export async function upsertHrGeoCheckinPolicy(input: {
  organizationId: string;
  actorAuthUserId: string;
  policyGroupCode?: string;
  label: string;
  policyDetails?: Partial<HrGeoCheckinPolicyDetails>;
  active?: boolean;
}): Promise<{ policyId: string; policyGroupCode: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const active = input.active ?? true;
  const policyDetails: HrGeoCheckinPolicyDetails = {
    ...DEFAULT_HR_GEO_CHECKIN_POLICY_DETAILS,
    ...input.policyDetails,
  };

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrGeoCheckinPolicies.id })
      .from(hrGeoCheckinPolicies)
      .where(
        and(
          eq(hrGeoCheckinPolicies.organizationId, input.organizationId),
          eq(hrGeoCheckinPolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrGeoCheckinPolicies)
        .set({
          label: input.label.trim(),
          policyDetails,
          active,
        })
        .where(eq(hrGeoCheckinPolicies.id, existing.id));

      await appendHrGeoAuditEvent({
        organizationId: input.organizationId,
        action: "policy_updated",
        auditKey: "erp.hrm.geo.policy.updated",
        actorAuthUserId: input.actorAuthUserId,
        metadata: { policyId: existing.id, policyGroupCode },
      });

      return { policyId: existing.id, policyGroupCode };
    }

    const policyId = createEntityId("hr_geo_policy");
    await db.insert(hrGeoCheckinPolicies).values({
      id: policyId,
      organizationId: input.organizationId,
      policyGroupCode,
      label: input.label.trim(),
      policyDetails,
      active,
    });

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "policy_updated",
      auditKey: "erp.hrm.geo.policy.updated",
      actorAuthUserId: input.actorAuthUserId,
      metadata: { policyId, policyGroupCode, created: true },
    });

    return { policyId, policyGroupCode };
  });
}

/** HRM-GEO-009 — create or update scoped eligibility rule. */
export async function upsertHrGeoEligibilityRule(input: {
  organizationId: string;
  actorAuthUserId: string;
  ruleId?: string;
  policyGroupCode?: string;
  legalEntityCode?: string | null;
  countryCode?: string | null;
  workLocationCode?: string | null;
  departmentId?: string | null;
  roleCode?: string | null;
  grade?: string | null;
  employmentType?: string | null;
  employeeCategory?: string | null;
  eligible?: boolean;
  requiresExceptionApproval?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ ruleId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const values = {
      policyGroupCode,
      legalEntityCode: input.legalEntityCode ?? null,
      countryCode: input.countryCode ?? null,
      workLocationCode: input.workLocationCode ?? null,
      departmentId: input.departmentId ?? null,
      roleCode: input.roleCode ?? null,
      grade: input.grade ?? null,
      employmentType: input.employmentType ?? null,
      employeeCategory: input.employeeCategory ?? null,
      eligible: input.eligible ?? true,
      requiresExceptionApproval: input.requiresExceptionApproval ?? false,
      effectiveFrom: input.effectiveFrom ?? new Date(),
      effectiveTo: input.effectiveTo ?? null,
    };

    if (input.ruleId) {
      const [existing] = await db
        .select({ id: hrGeoEligibilityRules.id })
        .from(hrGeoEligibilityRules)
        .where(
          and(
            eq(hrGeoEligibilityRules.organizationId, input.organizationId),
            eq(hrGeoEligibilityRules.id, input.ruleId),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new HrGeoCommandError("policy_not_found");
      }

      await db
        .update(hrGeoEligibilityRules)
        .set(values)
        .where(eq(hrGeoEligibilityRules.id, existing.id));

      await appendHrGeoAuditEvent({
        organizationId: input.organizationId,
        action: "policy_updated",
        auditKey: "erp.hrm.geo.policy.updated",
        actorAuthUserId: input.actorAuthUserId,
        metadata: { ruleId: existing.id, policyGroupCode },
      });

      return { ruleId: existing.id };
    }

    const ruleId = createEntityId("hr_geo_elig");
    await db.insert(hrGeoEligibilityRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      ...values,
    });

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "policy_updated",
      auditKey: "erp.hrm.geo.policy.updated",
      actorAuthUserId: input.actorAuthUserId,
      metadata: { ruleId, policyGroupCode, created: true },
    });

    return { ruleId };
  });
}

/** HRM-GEO-010 — register employee device for remote check-in verification. */
export async function registerHrGeoDevice(input: {
  organizationId: string;
  actorAuthUserId: string;
  employeeId: string;
  deviceFingerprint: string;
  deviceLabel?: string | null;
  platform?: string | null;
}): Promise<{ deviceId: string }> {
  await loadEmployeeGeoContext(input.organizationId, input.employeeId);
  const fingerprint = input.deviceFingerprint.trim();
  if (!fingerprint) {
    throw new HrGeoCommandError("device_not_registered");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrGeoRegisteredDevices.id })
      .from(hrGeoRegisteredDevices)
      .where(
        and(
          eq(hrGeoRegisteredDevices.organizationId, input.organizationId),
          eq(hrGeoRegisteredDevices.deviceFingerprint, fingerprint),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrGeoRegisteredDevices)
        .set({
          employeeId: input.employeeId,
          deviceLabel: input.deviceLabel?.trim() || null,
          platform: input.platform?.trim() || null,
          status: "registered",
          lastSeenAt: new Date(),
        })
        .where(eq(hrGeoRegisteredDevices.id, existing.id));

      await appendHrGeoAuditEvent({
        organizationId: input.organizationId,
        action: "device_registered",
        auditKey: "erp.hrm.geo.device.registered",
        actorAuthUserId: input.actorAuthUserId,
        employeeId: input.employeeId,
        metadata: { deviceId: existing.id, updated: true },
      });

      return { deviceId: existing.id };
    }

    const deviceId = createEntityId("hr_geo_dev");
    await db.insert(hrGeoRegisteredDevices).values({
      id: deviceId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      deviceFingerprint: fingerprint,
      deviceLabel: input.deviceLabel?.trim() || null,
      platform: input.platform?.trim() || null,
      status: "registered",
      registeredAt: new Date(),
      lastSeenAt: new Date(),
    });

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "device_registered",
      auditKey: "erp.hrm.geo.device.registered",
      actorAuthUserId: input.actorAuthUserId,
      employeeId: input.employeeId,
      metadata: { deviceId, created: true },
    });

    return { deviceId };
  });
}

/** HRM-GEO-010/011 — suspend or revoke a registered device. */
export async function updateHrGeoDeviceStatus(input: {
  organizationId: string;
  actorAuthUserId: string;
  deviceId: string;
  status: (typeof hrGeoRegisteredDevices.$inferSelect)["status"];
}): Promise<{ deviceId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({
        id: hrGeoRegisteredDevices.id,
        employeeId: hrGeoRegisteredDevices.employeeId,
      })
      .from(hrGeoRegisteredDevices)
      .where(
        and(
          eq(hrGeoRegisteredDevices.organizationId, input.organizationId),
          eq(hrGeoRegisteredDevices.id, input.deviceId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrGeoCommandError("device_not_registered");
    }

    await db
      .update(hrGeoRegisteredDevices)
      .set({ status: input.status })
      .where(eq(hrGeoRegisteredDevices.id, existing.id));

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "device_registered",
      auditKey: "erp.hrm.geo.device.registered",
      actorAuthUserId: input.actorAuthUserId,
      employeeId: existing.employeeId,
      metadata: { deviceId: existing.id, status: input.status },
    });

    return { deviceId: existing.id };
  });
}

