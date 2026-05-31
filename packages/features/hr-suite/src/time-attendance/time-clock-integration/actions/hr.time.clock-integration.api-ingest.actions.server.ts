import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import {
  HrTimeClockCommandError,
  ingestHrTimeClockApiPunchBatch,
  resolveHrTimeClockIngestDevice,
} from "../data/hr.time.clock-integration-ingest.shared.server";
import {
  resolveHrTimeClockIngestAuth,
  type HrTimeClockIngestAuthContext,
} from "../data/hr.time.clock-integration-sync.shared.server";
import { hrTimeClockApiIngestBodySchema } from "../schemas/hr.time.clock-integration-punch.schema";

export type HrTimeClockApiIngestRequest = {
  authorizationHeader: string | null;
  organizationIdHeader?: string | null;
  externalDeviceIdHeader?: string | null;
  body: unknown;
};

/** HRM-TCI-010 — JSON API ingestion (no session; API key or device credential). */
export async function ingestHrTimeClockPunchesApiHandler(
  request: HrTimeClockApiIngestRequest,
): Promise<
  ActionResult<{
    batchId: string;
    insertedCount: number;
    duplicateCount: number;
    deviceId: string;
  }>
> {
  const auth = await resolveHrTimeClockIngestAuth({
    authorizationHeader: request.authorizationHeader,
    organizationIdHeader: request.organizationIdHeader,
    externalDeviceIdHeader: request.externalDeviceIdHeader,
  });

  if (!auth.ok) {
    return actionFailure(`hr_time_clock_api_auth_${auth.reason}`);
  }

  const parsed = hrTimeClockApiIngestBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const organizationId = resolveOrganizationId(auth.context);
  const device = await resolveHrTimeClockIngestDevice({
    organizationId,
    deviceId:
      parsed.data.deviceId ??
      (auth.context.mode === "device_credential"
        ? auth.context.device.id
        : undefined),
    externalDeviceId: parsed.data.externalDeviceId,
  });

  if (!device) {
    return actionFailure("hr_time_clock_device_not_found");
  }

  if (device.status !== "active") {
    return actionFailure("hr_time_clock_device_inactive");
  }

  try {
    const result = await ingestHrTimeClockApiPunchBatch({
      organizationId,
      deviceId: device.id,
      batchKey: parsed.data.batchKey,
      offlineReconcile: parsed.data.offlineReconcile,
      punches: parsed.data.punches,
    });

    return actionSuccess({
      batchId: result.batchId,
      insertedCount: result.insertedCount,
      duplicateCount: result.duplicateCount,
      deviceId: device.id,
    });
  } catch (error) {
    if (error instanceof HrTimeClockCommandError) {
      return actionFailure(error.code);
    }
    if (error instanceof Error) {
      return actionFailure(error.message);
    }
    return actionFailure("hr_time_clock_api_ingest_failed");
  }
}

function resolveOrganizationId(context: HrTimeClockIngestAuthContext): string {
  return context.organizationId;
}
