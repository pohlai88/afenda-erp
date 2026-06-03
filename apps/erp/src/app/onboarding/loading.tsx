import { onboardingLoadingCopy } from "@afenda/kernel";

import { RouteLoadingFallback } from "@/routes/route-state";

export default function OnboardingLoading() {
  return (
    <RouteLoadingFallback
      description={onboardingLoadingCopy.description}
      title={onboardingLoadingCopy.title}
    />
  );
}
