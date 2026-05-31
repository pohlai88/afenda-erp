import { HR_CAREER_PATHING_ROUTE_SEGMENT } from "../schemas/hr.talent.career-pathing-constants.shared";

/** Locale-agnostic route segments (app composes `/{locale}/o/{orgSlug}/…`). */
export const hrTalentCareerPathingRoutePaths = {
  hrHub: `/hr/${HR_CAREER_PATHING_ROUTE_SEGMENT}`,
  hrmHub: `/apps/hrm/${HR_CAREER_PATHING_ROUTE_SEGMENT}`,
} as const;

export type HrTalentCareerPathingRoutePath =
  (typeof hrTalentCareerPathingRoutePaths)[keyof typeof hrTalentCareerPathingRoutePaths];
