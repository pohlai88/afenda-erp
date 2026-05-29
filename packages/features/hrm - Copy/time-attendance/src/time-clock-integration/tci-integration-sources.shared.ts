import {
  TCI_DEVICE_TYPES,
  type TciDeviceType,
} from "./schemas/tci-workflow-state.shared"
import {
  TCI_SYNC_SOURCE_KINDS,
  type TciSyncSourceKind,
} from "./schemas/tci-workflow-state.shared"

/**
 * HRM-TCI-001 — physical terminal families registered on devices and reached via
 * scheduled vendor pull (Zebra / UKG / generic poll) or API ingest from on-prem gateways.
 */
export const TCI_PHYSICAL_DEVICE_TYPES = [
  "biometric",
  "card",
  "rfid",
  "kiosk",
] as const satisfies readonly TciDeviceType[]

/**
 * HRM-TCI-001 — digital capture surfaces (browser / kiosk software, programmatic feeds).
 */
export const TCI_DIGITAL_DEVICE_TYPES = [
  "web",
  "api",
] as const satisfies readonly TciDeviceType[]

export type TciPhysicalDeviceType = (typeof TCI_PHYSICAL_DEVICE_TYPES)[number]
export type TciDigitalDeviceType = (typeof TCI_DIGITAL_DEVICE_TYPES)[number]

export type TciIntegrationChannelKind = "physical" | "digital"

export type TciIntegrationIngestChannel = {
  readonly id: TciSyncSourceKind
  readonly kind: TciIntegrationChannelKind
  readonly mechanism: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

/** Ingest planes that satisfy HRM-TCI-001 alongside registered device types. */
export const TCI_INTEGRATION_INGEST_CHANNELS = [
  {
    id: "api",
    kind: "digital",
    mechanism: "POST /api/erp/hrm/time-clock/ingest",
    requirementCodes: [
      "HRM-TCI-001",
      "HRM-TCI-008",
      "HRM-TCI-010",
      "HRM-TCI-013",
      "HRM-TCI-015",
    ],
  },
  {
    id: "manual_import",
    kind: "digital",
    mechanism: "system-admin CSV adapter hrm_time_clock_import",
    requirementCodes: [
      "HRM-TCI-001",
      "HRM-TCI-009",
      "HRM-TCI-013",
      "HRM-TCI-015",
    ],
  },
  {
    id: "scheduled",
    kind: "physical",
    mechanism: "cron vendor adapters (poll:, vendor:zebra:, vendor:ukg:)",
    requirementCodes: [
      "HRM-TCI-001",
      "HRM-TCI-008",
      "HRM-TCI-011",
      "HRM-TCI-013",
      "HRM-TCI-015",
    ],
  },
  {
    id: "offline_replay",
    kind: "physical",
    mechanism:
      "batched ingest after device reconnect (sourceKind offline_replay)",
    requirementCodes: [
      "HRM-TCI-001",
      "HRM-TCI-008",
      "HRM-TCI-012",
      "HRM-TCI-013",
      "HRM-TCI-015",
    ],
  },
] as const satisfies readonly TciIntegrationIngestChannel[]

export const TCI_VENDOR_INTEGRATION_ADAPTER_IDS = [
  "zebra",
  "ukg",
  "http_poll",
] as const

export type TciVendorIntegrationAdapterId =
  (typeof TCI_VENDOR_INTEGRATION_ADAPTER_IDS)[number]

export function isPhysicalTimeClockDeviceType(
  deviceType: TciDeviceType
): deviceType is TciPhysicalDeviceType {
  return (TCI_PHYSICAL_DEVICE_TYPES as readonly string[]).includes(deviceType)
}

export function isDigitalTimeClockDeviceType(
  deviceType: TciDeviceType
): deviceType is TciDigitalDeviceType {
  return (TCI_DIGITAL_DEVICE_TYPES as readonly string[]).includes(deviceType)
}

/** Every {@link TCI_DEVICE_TYPES} value is classified physical or digital (HRM-TCI-001 / 002). */
export function assertTimeClockDeviceTypePartition(): void {
  const classified = new Set<string>([
    ...TCI_PHYSICAL_DEVICE_TYPES,
    ...TCI_DIGITAL_DEVICE_TYPES,
  ])
  for (const deviceType of TCI_DEVICE_TYPES) {
    if (!classified.has(deviceType)) {
      throw new Error(
        `TCI device type "${deviceType}" is not classified for HRM-TCI-001`
      )
    }
  }
  if (classified.size !== TCI_DEVICE_TYPES.length) {
    throw new Error(
      "TCI physical/digital device type partition overlaps or drifts"
    )
  }
  for (const kind of TCI_SYNC_SOURCE_KINDS) {
    if (
      !TCI_INTEGRATION_INGEST_CHANNELS.some((channel) => channel.id === kind)
    ) {
      throw new Error(
        `TCI sync source kind "${kind}" missing from integration ingest channels`
      )
    }
  }
}

export function listTciIntegrationIngestChannels(): readonly TciIntegrationIngestChannel[] {
  return TCI_INTEGRATION_INGEST_CHANNELS
}
