import {
  archiveHrTimeClockEmployeeMapping,
  getHrTimeClockEmployeeMappingById,
  HrTimeClockCommandError,
  listHrTimeClockEmployeeMappingsWindow,
  upsertHrTimeClockEmployeeMapping,
  type HrTimeClockEmployeeMappingRow,
  type HrTimeClockEmployeeMappingWindow,
} from "@afenda/db";

import type {
  ArchiveHrTimeClockEmployeeMappingInput,
  UpsertHrTimeClockEmployeeMappingInput,
} from "../schemas/hr.time.clock-integration-mapping.schema";

export { HrTimeClockCommandError };
export type { HrTimeClockEmployeeMappingRow, HrTimeClockEmployeeMappingWindow };

export async function listHrTimeClockEmployeeMappingsForOrg(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  deviceId?: string;
  employeeId?: string;
  includeInactive?: boolean;
}): Promise<HrTimeClockEmployeeMappingWindow> {
  return listHrTimeClockEmployeeMappingsWindow({
    organizationId: input.organizationId,
    limit: input.limit,
    offset: input.offset,
    deviceId: input.deviceId,
    employeeId: input.employeeId,
    status: input.includeInactive ? undefined : "active",
  });
}

export async function getHrTimeClockEmployeeMappingForOrg(input: {
  organizationId: string;
  mappingId: string;
}): Promise<HrTimeClockEmployeeMappingRow | null> {
  return getHrTimeClockEmployeeMappingById(input);
}

export async function upsertHrTimeClockEmployeeMappingCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpsertHrTimeClockEmployeeMappingInput;
}) {
  return upsertHrTimeClockEmployeeMapping({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    mappingId: input.payload.mappingId,
    deviceId: input.payload.deviceId,
    employeeId: input.payload.employeeId,
    deviceUserId: input.payload.deviceUserId,
    badgeId: input.payload.badgeId,
    biometricId: input.payload.biometricId,
    clockId: input.payload.clockId,
    status: input.payload.status,
  });
}

export async function archiveHrTimeClockEmployeeMappingCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: ArchiveHrTimeClockEmployeeMappingInput;
}) {
  return archiveHrTimeClockEmployeeMapping({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    mappingId: input.payload.mappingId,
  });
}
