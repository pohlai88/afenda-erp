import {
  getHrTimeClockDeviceById,
  HrTimeClockCommandError,
  listHrTimeClockDevicesWindow,
  registerHrTimeClockDevice,
  updateHrTimeClockDevice,
  type HrTimeClockDeviceRow,
  type HrTimeClockDeviceWindow,
} from "@afenda/db";

import type {
  HrTimeClockDeviceStatus,
  HrTimeClockDeviceType,
  HrTimeClockSyncConfigInput,
  RegisterHrTimeClockDeviceInput,
  UpdateHrTimeClockDeviceInput,
} from "../schemas/hr.time.clock-integration-device.schema";

export { HrTimeClockCommandError };
export type { HrTimeClockDeviceRow, HrTimeClockDeviceWindow };

export async function listHrTimeClockDevicesForOrg(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrTimeClockDeviceStatus;
  deviceType?: HrTimeClockDeviceType;
  locationCode?: string | null;
}): Promise<HrTimeClockDeviceWindow> {
  return listHrTimeClockDevicesWindow(input);
}

export async function getHrTimeClockDeviceForOrg(input: {
  organizationId: string;
  deviceId: string;
}): Promise<HrTimeClockDeviceRow | null> {
  return getHrTimeClockDeviceById(input);
}

export async function registerHrTimeClockDeviceCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: RegisterHrTimeClockDeviceInput;
}) {
  return registerHrTimeClockDevice({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    externalDeviceId: input.payload.externalDeviceId,
    name: input.payload.name,
    deviceType: input.payload.deviceType,
    locationCode: input.payload.locationCode,
    status: input.payload.status,
    syncConfig: input.payload.syncConfig,
    apiCredentialRef: input.payload.apiCredentialRef,
    breaksEnabled: input.payload.breaksEnabled,
  });
}

export async function updateHrTimeClockDeviceCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: UpdateHrTimeClockDeviceInput;
}) {
  return updateHrTimeClockDevice({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    deviceId: input.payload.deviceId,
    name: input.payload.name,
    deviceType: input.payload.deviceType,
    locationCode: input.payload.locationCode,
    status: input.payload.status,
    syncConfig: input.payload.syncConfig as HrTimeClockSyncConfigInput | undefined,
    apiCredentialRef: input.payload.apiCredentialRef,
    breaksEnabled: input.payload.breaksEnabled,
    lastSyncAt:
      input.payload.lastSyncAt === undefined
        ? undefined
        : input.payload.lastSyncAt === null
          ? null
          : new Date(input.payload.lastSyncAt),
  });
}
