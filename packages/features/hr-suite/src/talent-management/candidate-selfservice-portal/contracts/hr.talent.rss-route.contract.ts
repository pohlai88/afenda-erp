export const hrTalentRssRoutePaths = {
  hub: "/hr/candidate-selfservice-portal",
} as const;

export type HrTalentRssRoutePath =
  (typeof hrTalentRssRoutePaths)[keyof typeof hrTalentRssRoutePaths];
