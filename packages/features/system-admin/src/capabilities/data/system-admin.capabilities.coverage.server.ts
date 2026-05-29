import { appCapabilities, isAppCapability } from "@afenda/auth";
import type {
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
} from "@afenda/db";
import type { ExecutionCapability } from "@afenda/kernel/execution-capabilities";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import type {
  CapabilityCoverageVerdict,
  SystemAdminCapabilityAvailability,
  SystemAdminCapabilityCoverageRow,
  SystemAdminCapabilityReadinessVerdict,
} from "../contracts";
import { isCriticalExecutionCapability } from "../contracts/system-admin.capability-safety.contract";

function isSensitiveCapability(capability: ExecutionCapability) {
  return isCriticalExecutionCapability(capability);
}

function resolveOrgAvailability(
  capabilityKey: string,
  settingsByCapability: Map<string, TenantCapabilitySettingRow>,
): SystemAdminCapabilityAvailability {
  return settingsByCapability.get(capabilityKey)?.availability ?? "enabled";
}

export function resolveSystemAdminCapabilityReadinessVerdict(input: {
  coverageVerdict: CapabilityCoverageVerdict;
  availability: SystemAdminCapabilityAvailability;
  issues: readonly string[];
}): SystemAdminCapabilityReadinessVerdict {
  if (
    input.coverageVerdict === "disabled" ||
    input.coverageVerdict === "missing_permission" ||
    input.availability === "disabled" ||
    input.issues.some(
      (issue) =>
        issue.includes("Parent module is disabled") ||
        issue.includes("missing a required permission"),
    )
  ) {
    return "blocked";
  }

  if (
    input.coverageVerdict !== "covered" ||
    input.availability === "preview" ||
    input.issues.length > 0
  ) {
    return "warning";
  }

  return "ready";
}

function moduleIsDisabled(
  moduleKey: string,
  settingsByModule: Map<string, TenantModuleSettingRow>,
) {
  const setting = settingsByModule.get(moduleKey);

  if (!setting) {
    return false;
  }

  return (
    setting.enabled === false ||
    setting.visible === false ||
    setting.readiness === "blocked" ||
    setting.readiness === "deprecated"
  );
}

function capabilityOrgAvailability(
  capabilityKey: string,
  settingsByCapability: Map<string, TenantCapabilitySettingRow>,
) {
  return settingsByCapability.get(capabilityKey)?.availability;
}

export function evaluateCapabilityCoverage(input: {
  capability: ExecutionCapability;
  moduleSettings?: readonly TenantModuleSettingRow[];
  capabilitySettings?: readonly TenantCapabilitySettingRow[];
}): {
  verdict: CapabilityCoverageVerdict;
  issues: string[];
} {
  const issues: string[] = [];
  const settingsByModule = new Map(
    (input.moduleSettings ?? []).map((setting) => [setting.moduleKey, setting]),
  );
  const settingsByCapability = new Map(
    (input.capabilitySettings ?? []).map((setting) => [
      setting.capabilityKey,
      setting,
    ]),
  );
  const orgAvailability = capabilityOrgAvailability(
    input.capability.key,
    settingsByCapability,
  );

  if (!input.capability.moduleKey) {
    issues.push("Capability is missing a module key.");
  }

  if (!input.capability.requiredPermission) {
    issues.push("Capability is missing a required permission.");
  } else if (!isAppCapability(input.capability.requiredPermission)) {
    issues.push(
      `Required permission ${input.capability.requiredPermission} is not in the declared catalog.`,
    );
  }

  if (!input.capability.route) {
    issues.push("Capability does not declare a route.");
  }

  if (!input.capability.auditArea) {
    issues.push("Capability does not declare an audit area.");
  } else if (isSensitiveCapability(input.capability) && !input.capability.route) {
    issues.push(
      "Sensitive capability should declare a routed surface for audit correlation.",
    );
  }

  if (moduleIsDisabled(input.capability.moduleKey, settingsByModule)) {
    issues.push("Parent module is disabled or hidden for this organization.");
  }

  if (input.capability.status === "deprecated") {
    issues.push("Capability is marked deprecated in the execution kernel.");
  }

  if (orgAvailability === "disabled") {
    issues.push("Capability is disabled for this organization.");
  }

  if (orgAvailability === "preview") {
    issues.push("Capability is in preview mode for this organization.");
  }

  let verdict: CapabilityCoverageVerdict = "covered";

  if (issues.some((issue) => issue.includes("disabled") || issue.includes("deprecated"))) {
    verdict = "disabled";
  } else if (!isAppCapability(input.capability.requiredPermission)) {
    verdict = "missing_permission";
  } else if (!input.capability.route) {
    verdict = "missing_route";
  } else if (
    issues.some((issue) => issue.includes("audit"))
  ) {
    verdict = "missing_audit";
  } else if (issues.length > 0) {
    verdict = "missing_docs";
  }

  return { verdict, issues };
}

export function buildSystemAdminCapabilityCoverageRows(input?: {
  moduleSettings?: readonly TenantModuleSettingRow[];
  capabilitySettings?: readonly TenantCapabilitySettingRow[];
}): SystemAdminCapabilityCoverageRow[] {
  return listExecutionCapabilities().map((capability) => {
    const { verdict, issues } = evaluateCapabilityCoverage({
      capability,
      moduleSettings: input?.moduleSettings,
      capabilitySettings: input?.capabilitySettings,
    });
    const settingsByCapability = new Map(
      (input?.capabilitySettings ?? []).map((setting) => [
        setting.capabilityKey,
        setting,
      ]),
    );
    const availability = resolveOrgAvailability(
      capability.key,
      settingsByCapability,
    );

    return {
      id: capability.key,
      capability: capability.key,
      module: capability.moduleKey,
      route: capability.route ?? "Not routed",
      routeHref: capability.route,
      requiredPermission: capability.requiredPermission,
      availability,
      accessCoverage: appCapabilities.includes(capability.requiredPermission)
        ? "Catalog"
        : "Missing",
      auditCoverage: capability.auditArea ? "Declared" : "Missing",
      docsCoverage: capability.description ? "Declared" : "Missing",
      coverageVerdict: verdict,
      readinessVerdict: resolveSystemAdminCapabilityReadinessVerdict({
        coverageVerdict: verdict,
        availability,
        issues,
      }),
      issues,
    };
  });
}
