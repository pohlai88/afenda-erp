import { onboardingLoadingCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function OnboardingLoading() {
  return (
    <RouteStatePanel
      description={onboardingLoadingCopy.description}
      title={onboardingLoadingCopy.title}
    />
  );
}
