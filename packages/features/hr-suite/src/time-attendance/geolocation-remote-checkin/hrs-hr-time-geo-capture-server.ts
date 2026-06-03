import {
  captureHrGeoRemoteCheckin,
  type HrGeoCheckinAction,
  type HrGeoSpoofingSignals,
} from "@afenda/db";

import { collectHrGeoClientSpoofingSignals } from "./hr.time.geo-spoofing.shared";

export type HrGeoCaptureInput = {
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
  mockProvider?: boolean;
  clientMetadata?: Record<string, unknown>;
  idempotencyKey?: string | null;
  policyGroupCode?: string;
};

/** HRM-GEO-001..015,020..023 — server capture with validation (event-only; no tracking). */
export async function submitHrGeoRemoteCheckinCapture(input: HrGeoCaptureInput) {
  const clientSpoofingSignals: HrGeoSpoofingSignals = collectHrGeoClientSpoofingSignals({
    mockProvider: input.mockProvider,
    accuracyMeters: input.accuracyMeters,
    capturedAtMs: input.capturedAt.getTime(),
    serverNowMs: Date.now(),
  });

  return captureHrGeoRemoteCheckin({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    actorAuthUserId: input.actorAuthUserId,
    action: input.action,
    capturedAt: input.capturedAt,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracyMeters: input.accuracyMeters,
    deviceFingerprint: input.deviceFingerprint,
    deviceReference: input.deviceReference,
    projectSiteRef: input.projectSiteRef,
    clientSiteRef: input.clientSiteRef,
    selfieBlobUrl: input.selfieBlobUrl,
    clientSpoofingSignals,
    clientMetadata: input.clientMetadata,
    idempotencyKey: input.idempotencyKey,
    policyGroupCode: input.policyGroupCode,
  });
}
