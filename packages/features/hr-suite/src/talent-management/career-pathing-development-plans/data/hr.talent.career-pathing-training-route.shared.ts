import { HR_CAREER_PATHING_TRAINING_ROUTE } from "../schemas/hr.talent.career-pathing-constants.shared";
import { hrTalentCareerPathRoutePaths } from "../contracts/hr.talent.career-pathing.contract";

/** Locale-aware deep link to Training & Development (HRM-CAR-014 / CAR-028). */
export function buildHrCareerPathTrainingRoute(input?: {
  locale?: string;
  orgSlug?: string;
}): string {
  const path = hrTalentCareerPathRoutePaths.training;

  if (input?.locale && input?.orgSlug) {
    return `/${input.locale}/o/${input.orgSlug}${path}`;
  }

  return path;
}

export function buildHrCareerPathTrainingLinkLabel(): string {
  return "Open Training & Development";
}

export function formatHrCareerPathTrainingCourseRef(courseId: string): string {
  return `${HR_CAREER_PATHING_TRAINING_ROUTE}?courseId=${encodeURIComponent(courseId)}`;
}

export {
  HR_CAREER_PATHING_TRAINING_ROUTE,
  hrTalentCareerPathRoutePaths,
};
