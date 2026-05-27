import { onboardingLoadingCopy } from "@afenda/domain";
import { RouteStatePanel } from "@/components/route-states";

export default function OnboardingLoading() {
  return (
    <RouteStatePanel
      description={onboardingLoadingCopy.description}
      title={onboardingLoadingCopy.title}
    />
  );
}
