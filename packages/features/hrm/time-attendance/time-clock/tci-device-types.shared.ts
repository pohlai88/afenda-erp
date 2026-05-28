import {
  TCI_DEVICE_TYPES,
  type TciDeviceType,
} from "./schemas/tci-workflow-state.shared"
import {
  TCI_PHYSICAL_DEVICE_TYPES,
  assertTimeClockDeviceTypePartition,
} from "./tci-integration-sources.shared"

/** Registry device types that satisfy the HRM-TCI-002 terminal families (excludes programmatic `api`). */
export const TCI_HRM_TCI_002_DEVICE_TYPES = [
  "biometric",
  "card",
  "rfid",
  "kiosk",
  "web",
] as const satisfies readonly TciDeviceType[]

export type TciHrmTci002DeviceType =
  (typeof TCI_HRM_TCI_002_DEVICE_TYPES)[number]

export type TciDeviceTypeFamilyId =
  | "biometric_terminal"
  | "card_reader"
  | "rfid_terminal"
  | "kiosk_clock"
  | "web_clock"
  | "api_feed"
  | "mobile_clock"

export type TciTciRegistryDeviceTypeFamily = {
  readonly id: TciDeviceTypeFamilyId
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
  readonly labelKey: `deviceTypeFamilyLabels.${TciDeviceTypeFamilyId}`
  readonly registry: "tci"
  readonly deviceType: TciDeviceType
}

export type TciGeolocationMobileClockFamily = {
  readonly id: "mobile_clock"
  readonly requirementCodes: readonly ["HRM-TCI-002"]
  readonly labelKey: "deviceTypeFamilyLabels.mobile_clock"
  readonly registry: "geolocation"
  readonly moduleSegment: "geolocation"
  readonly attendanceSource: "mobile"
}

export type TciDeviceTypeFamily =
  | TciTciRegistryDeviceTypeFamily
  | TciGeolocationMobileClockFamily

/**
 * HRM-TCI-002 — biometric, card, RFID, kiosk, web on the TCI registry; mobile clocks
 * when GEO is enabled (Geolocation module writes `source: mobile`, not TCI ingest).
 */
export const TCI_DEVICE_TYPE_FAMILIES = [
  {
    id: "biometric_terminal",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.biometric_terminal",
    registry: "tci",
    deviceType: "biometric",
  },
  {
    id: "card_reader",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.card_reader",
    registry: "tci",
    deviceType: "card",
  },
  {
    id: "rfid_terminal",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.rfid_terminal",
    registry: "tci",
    deviceType: "rfid",
  },
  {
    id: "kiosk_clock",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.kiosk_clock",
    registry: "tci",
    deviceType: "kiosk",
  },
  {
    id: "web_clock",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.web_clock",
    registry: "tci",
    deviceType: "web",
  },
  {
    id: "api_feed",
    requirementCodes: ["HRM-TCI-001", "HRM-TCI-010"],
    labelKey: "deviceTypeFamilyLabels.api_feed",
    registry: "tci",
    deviceType: "api",
  },
  {
    id: "mobile_clock",
    requirementCodes: ["HRM-TCI-002"],
    labelKey: "deviceTypeFamilyLabels.mobile_clock",
    registry: "geolocation",
    moduleSegment: "geolocation",
    attendanceSource: "mobile",
  },
] as const satisfies readonly TciDeviceTypeFamily[]

export const TCI_MOBILE_CLOCK_FAMILY: TciGeolocationMobileClockFamily =
  TCI_DEVICE_TYPE_FAMILIES.find(
    (family) => family.id === "mobile_clock"
  ) as TciGeolocationMobileClockFamily

export function listTciRegistryDeviceTypeFamilies(): readonly TciTciRegistryDeviceTypeFamily[] {
  const families: TciTciRegistryDeviceTypeFamily[] = []
  for (const family of TCI_DEVICE_TYPE_FAMILIES) {
    if (family.registry === "tci") {
      families.push(family)
    }
  }
  return families
}

export function assertHrmTci002DeviceTypeCoverage(): void {
  assertTimeClockDeviceTypePartition()

  for (const deviceType of TCI_HRM_TCI_002_DEVICE_TYPES) {
    if (!(TCI_DEVICE_TYPES as readonly string[]).includes(deviceType)) {
      throw new Error(
        `HRM-TCI-002 device type "${deviceType}" missing from TCI_DEVICE_TYPES`
      )
    }
  }

  for (const deviceType of TCI_PHYSICAL_DEVICE_TYPES) {
    if (
      !(TCI_HRM_TCI_002_DEVICE_TYPES as readonly string[]).includes(deviceType)
    ) {
      throw new Error(
        `HRM-TCI-002 must cover physical device type "${deviceType}"`
      )
    }
  }

  if (!(TCI_HRM_TCI_002_DEVICE_TYPES as readonly string[]).includes("web")) {
    throw new Error('HRM-TCI-002 must cover digital device type "web"')
  }

  const tciFamilies = listTciRegistryDeviceTypeFamilies().filter((family) =>
    family.requirementCodes.includes("HRM-TCI-002")
  )
  const covered = new Set(tciFamilies.map((family) => family.deviceType))
  for (const deviceType of TCI_HRM_TCI_002_DEVICE_TYPES) {
    if (!covered.has(deviceType)) {
      throw new Error(
        `HRM-TCI-002 family manifest missing registry mapping for "${deviceType}"`
      )
    }
  }

  if (
    !TCI_MOBILE_CLOCK_FAMILY ||
    TCI_MOBILE_CLOCK_FAMILY.registry !== "geolocation"
  ) {
    throw new Error(
      "HRM-TCI-002 mobile clock family must bridge to geolocation"
    )
  }
}
