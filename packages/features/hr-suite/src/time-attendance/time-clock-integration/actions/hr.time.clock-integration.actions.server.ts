"use server";

import {
  listHrTimeClockDevicesWindow,
  listHrTimeClockPunchExceptionsWindow,
  listHrTimeClockRawPunchesWindow,
  listHrTimeClockSyncBatchesWindow,
} from "@afenda/db";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { z } from "zod";

import {
  buildTimeClockReportCsv,
  HR_TIME_CLOCK_REPORT_KINDS,
  type HrTimeClockReportCsvResult,
} from "../data/hr.time.clock-integration-reports.shared";
import { requireHrTimeClockRead } from "../policies/hr.time.clock-integration-access.policy.server";

const exportSchema = z.object({
  reportKind: z.enum(HR_TIME_CLOCK_REPORT_KINDS),
});

export async function exportHrTimeClockReportAction(
  formData: FormData,
): Promise<ActionResult<HrTimeClockReportCsvResult>> {
  try {
    const guard = await requireHrTimeClockRead();
    const parsed = exportSchema.parse({
      reportKind: formData.get("reportKind"),
    });
    const organizationId = guard.organization.id;

    switch (parsed.reportKind) {
      case "punches": {
        const window = await listHrTimeClockRawPunchesWindow({
          organizationId,
          limit: 5000,
        });
        return {
          ok: true,
          data: buildTimeClockReportCsv({
            reportKind: "punches",
            headers: [
              "id",
              "device",
              "employee",
              "punch_type",
              "punched_at",
              "validation_status",
            ],
            rows: window.rows.map((row) => [
              row.id,
              row.deviceName,
              row.employeeDisplayName ?? "unmapped",
              row.punchType,
              row.punchedAt.toISOString(),
              row.validationStatus,
            ]),
          }),
        };
      }
      case "exceptions": {
        const window = await listHrTimeClockPunchExceptionsWindow({
          organizationId,
          limit: 5000,
        });
        return {
          ok: true,
          data: buildTimeClockReportCsv({
            reportKind: "exceptions",
            headers: [
              "id",
              "employee",
              "exception_code",
              "device",
              "punched_at",
            ],
            rows: window.rows.map((row) => [
              row.id,
              row.employeeDisplayName ?? "unmapped",
              row.exceptionCode,
              row.deviceName,
              row.punchedAt.toISOString(),
            ]),
          }),
        };
      }
      case "sync": {
        const window = await listHrTimeClockSyncBatchesWindow({
          organizationId,
          limit: 5000,
        });
        return {
          ok: true,
          data: buildTimeClockReportCsv({
            reportKind: "sync",
            headers: [
              "id",
              "device",
              "batch_key",
              "status",
              "started_at",
              "record_count",
              "error",
            ],
            rows: window.rows.map((row) => [
              row.id,
              row.deviceName,
              row.batchKey,
              row.status,
              row.startedAt.toISOString(),
              String(row.recordCount),
              row.errorMessage ?? "",
            ]),
          }),
        };
      }
      case "devices":
      default: {
        const window = await listHrTimeClockDevicesWindow({
          organizationId,
          limit: 5000,
        });
        return {
          ok: true,
          data: buildTimeClockReportCsv({
            reportKind: "devices",
            headers: [
              "id",
              "external_device_id",
              "name",
              "type",
              "location",
              "status",
              "last_sync_at",
            ],
            rows: window.rows.map((row) => [
              row.id,
              row.externalDeviceId,
              row.name,
              row.deviceType,
              row.locationCode ?? "",
              row.status,
              row.lastSyncAt?.toISOString() ?? "",
            ]),
          }),
        };
      }
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "time_clock_report_export_failed",
    };
  }
}
