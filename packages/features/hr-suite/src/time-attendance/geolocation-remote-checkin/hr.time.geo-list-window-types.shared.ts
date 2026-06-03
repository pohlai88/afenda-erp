import type {
  HrGeoGeofenceWindow,
  HrGeoHistoryWindow,
} from "@afenda/db";

/** List window shapes for geo Pattern C builders (metadata door). */
export type HrGeoPendingExceptionsWindow = Awaited<
  ReturnType<typeof import("@afenda/db").listHrGeoPendingExceptionsWindow>
>;

export type HrGeoPoliciesWindow = Awaited<
  ReturnType<typeof import("@afenda/db").listHrGeoPoliciesWindow>
>;

export type HrGeoDevicesWindow = Awaited<
  ReturnType<typeof import("@afenda/db").listHrGeoRegisteredDevicesWindow>
>;

export type HrGeoAuditEventsWindow = Awaited<
  ReturnType<typeof import("@afenda/db").listHrGeoAuditEventsWindow>
>;

export type { HrGeoGeofenceWindow, HrGeoHistoryWindow };
