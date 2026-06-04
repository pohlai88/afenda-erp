import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import type { SystemAdminReliabilityTargetType } from "./sys-reliability-issue.contract";

export function resolveSystemAdminReliabilityTargetHref(input: {
  targetType: SystemAdminReliabilityTargetType;
  targetId?: string;
}) {
  switch (input.targetType) {
    case "cron_job":
      return systemAdminRoutePaths.reliability;
    case "integration":
    case "webhook":
      return systemAdminRoutePaths.integrations;
    case "workflow":
      return "/lynx/workflows";
    case "repository":
    case "migration":
    case "platform":
      return systemAdminRoutePaths.reliability;
    default: {
      const _exhaustive: never = input.targetType;
      return _exhaustive;
    }
  }
}

export function systemAdminReliabilityHubHref() {
  return systemAdminRoutePaths.reliability;
}
