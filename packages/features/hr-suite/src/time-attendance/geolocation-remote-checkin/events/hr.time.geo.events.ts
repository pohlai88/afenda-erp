import { GEO_AUDIT_KEYS } from "../contracts/geolocation.contract";

export const HR_GEO_AUDIT_EVENTS = GEO_AUDIT_KEYS;

export const hrGeoNotificationTemplates = {
  checkin_failed: {
    title: "Remote check-in failed",
    body: "Your remote check-in could not be verified. Submit an exception if required.",
  },
  outside_geofence: {
    title: "Outside approved geofence",
    body: "Your check-in was captured outside an approved location and needs review.",
  },
  pending_exception: {
    title: "Exception pending review",
    body: "A remote check-in exception is awaiting approver action.",
  },
  exception_approved: {
    title: "Exception approved",
    body: "Your remote check-in exception was approved.",
  },
  exception_rejected: {
    title: "Exception rejected",
    body: "Your remote check-in exception was rejected.",
  },
} as const;
