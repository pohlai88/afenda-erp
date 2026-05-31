export type HrOrgUnitType =
  | "company"
  | "division"
  | "department"
  | "team"
  | "cost_center";

export type HrOrgUnitStatus = "active" | "inactive" | "planned";

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
