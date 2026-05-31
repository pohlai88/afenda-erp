import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

/** HRM-OTM-016 — admin routing matrix list section shell. */
export function OtmApprovalRoutesSection(input: {
  surface: ListSurfaceRendererConfigurationResolvedInput;
}) {
  return (
    <GovernedPatternCListSection
      surfaceKey="hrm:overtime:approval-routes"
      surface={input.surface}
    />
  );
}
