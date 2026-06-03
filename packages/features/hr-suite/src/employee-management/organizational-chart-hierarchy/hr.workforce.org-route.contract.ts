export type HrOrgUnitType =
  | "business_unit"
  | "department"
  | "legal_entity"
  | "location"
  | "sub_department"
  | "team";

export type HrOrgUnitStatus = "active" | "closed" | "frozen" | "planned";

export type HrOrgChartNode = {
  id: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId: string | null;
  managerDisplayName: string | null;
  orgUnitStatus: HrOrgUnitStatus;
  childCount: number;
};

export const hrOrgRoutePaths = {
  hub: "/hr",
  org: "/hr/org",
} as const;

export type HrOrgRoutePath =
  (typeof hrOrgRoutePaths)[keyof typeof hrOrgRoutePaths];
