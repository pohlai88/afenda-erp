export const hrRonRoutePaths = {
  hub: "/hr/recruitment-onboarding",
} as const;

export type HrRonRoutePath =
  (typeof hrRonRoutePaths)[keyof typeof hrRonRoutePaths];

export function hrRonRequisitionDetailRoutePath(
  requisitionId: string,
): `/hr/recruitment-onboarding/requisitions/${string}` {
  return `/hr/recruitment-onboarding/requisitions/${requisitionId}`;
}

export function hrRonApplicationDetailRoutePath(
  applicationId: string,
): `/hr/recruitment-onboarding/applications/${string}` {
  return `/hr/recruitment-onboarding/applications/${applicationId}`;
}

export function hrRonOfferDetailRoutePath(
  offerId: string,
): `/hr/recruitment-onboarding/offers/${string}` {
  return `/hr/recruitment-onboarding/offers/${offerId}`;
}
