export const hrTrainingRoutePaths = {
  hub: "/hr/training-development",
} as const;

export const hrTalentTrainingRoutePaths = hrTrainingRoutePaths;

export type HrTalentTrainingRoutePath =
  (typeof hrTrainingRoutePaths)[keyof typeof hrTrainingRoutePaths];

export type HrTrainingRoutePath = HrTalentTrainingRoutePath;

export function hrTrainingCourseDetailRoutePath(courseId: string) {
  return `/hr/training-development/courses/${courseId}` as const;
}

export function hrTrainingCertificationDetailRoutePath(certificationId: string) {
  return `/hr/training-development/certifications/${certificationId}` as const;
}
