export const hrGeoRoutePaths = {
  hub: "/hr/geolocation-remote-checkin",
} as const;

export type HrGeoRoutePath = (typeof hrGeoRoutePaths)[keyof typeof hrGeoRoutePaths];
