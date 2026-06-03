import {
  HR_CAREER_PATHING_AUDIT_PREFIX,
  HR_CAREER_PATHING_ROUTE_SEGMENT,
  HR_TALENT_CAREER_PATH_READ_CAPABILITY,
  HR_TALENT_CAREER_PATH_WRITE_CAPABILITY,
} from "./hr.talent.career-pathing-constants.shared";

export const hrTalentCareerPathReadPermission = {
  module: "hr",
  object: "talent_career_path",
  function: "read",
} as const;

export const hrTalentCareerPathWritePermission = {
  module: "hr",
  object: "talent_career_path",
  function: "write",
} as const;

export const hrTalentCareerPathingReadPermission = hrTalentCareerPathReadPermission;
export const hrTalentCareerPathingWritePermission = hrTalentCareerPathWritePermission;

export {
  HR_CAREER_PATHING_AUDIT_PREFIX,
  HR_CAREER_PATHING_ROUTE_SEGMENT,
  HR_TALENT_CAREER_PATH_READ_CAPABILITY,
  HR_TALENT_CAREER_PATH_WRITE_CAPABILITY,
};

export const hrTalentCareerPathRoutePaths = {
  hub: `/apps/hrm/${HR_CAREER_PATHING_ROUTE_SEGMENT}`,
  training: "/apps/hrm/training",
} as const;

export const HR_TALENT_CAREER_PATHING_MODULE_KEY = "hr_talent_career_path" as const;

export type HrTalentCareerPathRoutePath =
  (typeof hrTalentCareerPathRoutePaths)[keyof typeof hrTalentCareerPathRoutePaths];
