export { maskHrGeoCoordinates } from "@afenda/db";

export function canViewHrGeoDetailedLocation(input: {
  canReadGeo: boolean;
  canReadLocationDetail: boolean;
}): boolean {
  return input.canReadGeo && input.canReadLocationDetail;
}
