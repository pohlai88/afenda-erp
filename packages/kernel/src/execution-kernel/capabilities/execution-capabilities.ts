import {
  appCapabilities,
  isAppCapability,
  type AppCapability,
} from "@afenda/auth";
import { type ModuleId } from "@afenda/config/module-ids";
import { moduleById } from "../../modules/definitions";
import {
  ExecutionCapabilityNotFoundError,
  ExecutionInvalidStateError,
} from "../errors/execution-errors";

export type ExecutionCapabilityStatus = "active" | "preview" | "deprecated";

export type ExecutionCapability = {
  key: string;
  moduleKey: string;
  label: string;
  description?: string;
  route?: `/${string}`;
  requiredPermission: AppCapability;
  auditArea: string;
  status: ExecutionCapabilityStatus;
};

const routeByCapability: Partial<Record<AppCapability, `/${string}`>> = {
  "dashboard.view": "/dashboard",
  "finance.view": "/finance",
  "sales.view": "/sales",
  "purchasing.view": "/purchasing",
  "inventory.view": "/inventory",
  "hr.view": "/hr",
  "hr.compliance.read": "/hr/compliance",
  "hr.compliance.write": "/hr/compliance",
  "hr.compliance.sensitive.read": "/hr/compliance",
  "hr.benefits.read": "/hr/benefits",
  "hr.benefits.write": "/hr/benefits",
  "hr.benefits.sensitive.read": "/hr/benefits",
  "hr.bonus.read": "/hr/bonus",
  "hr.bonus.write": "/hr/bonus",
  "hr.bonus.sensitive.read": "/hr/bonus",
  "hr.bonus.finance.read": "/hr/bonus",
  "hr.bonus.audit.read": "/hr/bonus",
  "hr.expense.read": "/hr/expenses",
  "hr.expense.write": "/hr/expenses",
  "hr.expense.approve": "/hr/expenses",
  "hr.expense.finance.read": "/hr/expenses",
  "hr.expense.audit.read": "/hr/expenses",
  "hr.expense.sensitive.read": "/hr/expenses",
  "hr.cpm.read": "/hr/compensation-planning",
  "hr.cpm.write": "/hr/compensation-planning",
  "hr.cpm.approve": "/hr/compensation-planning",
  "hr.csf.read": "/hr/competency-skills",
  "hr.csf.write": "/hr/competency-skills",
  "hr.performance.read": "/hr/performance-appraisals",
  "hr.performance.write": "/hr/performance-appraisals",
  "hr.performance.approve": "/hr/performance-appraisals",
  "hr.performance.calibrate": "/hr/performance-appraisals",
  "hr.performance.compensation.read": "/hr/performance-appraisals",
  "hr.performance.audit.read": "/hr/performance-appraisals",
  "hr.recruitment.read": "/hr/recruitment-onboarding",
  "hr.recruitment.write": "/hr/recruitment-onboarding",
  "hr.recruitment.approve": "/hr/recruitment-onboarding",
  "hr.recruitment.interview.write": "/hr/recruitment-onboarding",
  "hr.recruitment.offer.read": "/hr/recruitment-onboarding",
  "hr.recruitment.offer.write": "/hr/recruitment-onboarding",
  "hr.recruitment.offer.approve": "/hr/recruitment-onboarding",
  "hr.recruitment.onboarding.read": "/hr/recruitment-onboarding",
  "hr.recruitment.onboarding.write": "/hr/recruitment-onboarding",
  "hr.recruitment.finance.read": "/hr/recruitment-onboarding",
  "hr.recruitment.it.read": "/hr/recruitment-onboarding",
  "hr.recruitment.audit.read": "/hr/recruitment-onboarding",
  "hr.recruitment.sensitive.read": "/hr/recruitment-onboarding",
  "hr.recruitment.convert": "/hr/recruitment-onboarding",
  "hr.payroll.read": "/hr/payroll-processing",
  "hr.payroll.write": "/hr/payroll-processing",
  "hr.payroll.approve": "/hr/payroll-processing",
  "hr.payroll.audit.read": "/hr/payroll-processing/audit",
  "hr.payroll.ess.read": "/hr/payroll-processing",
  "hr.sbs.read": "/hr/salary-benchmarking",
  "hr.sbs.write": "/hr/salary-benchmarking",
  "hr.sbs.approve": "/hr/salary-benchmarking",
  "hr.documents.read": "/hr/documents",
  "hr.documents.write": "/hr/documents",
  "hr.documents.sensitive.read": "/hr/documents",
  "crm.view": "/crm",
  "approvals.view": "/approvals",
  "reports.view": "/reports",
  "system-admin.view": "/system-admin",
  "system-admin.identity.read": "/system-admin/identity",
  "system-admin.identity.write": "/system-admin/identity",
  "system-admin.users.read": "/system-admin/users",
  "system-admin.users.manage": "/system-admin/users",
  "system-admin.memberships.read": "/system-admin/memberships",
  "system-admin.memberships.manage": "/system-admin/memberships",
  "system-admin.roles.read": "/system-admin/roles",
  "system-admin.roles.manage": "/system-admin/roles",
  "system-admin.permissions.read": "/system-admin/permissions",
  "system-admin.permissions.manage": "/system-admin/permissions",
  "system-admin.modules.read": "/system-admin/modules",
  "system-admin.modules.manage": "/system-admin/modules",
  "system-admin.capabilities.read": "/system-admin/capabilities",
  "system-admin.capabilities.manage": "/system-admin/capabilities",
  "system-admin.policies.read": "/system-admin/policies",
  "system-admin.policies.review": "/system-admin/policies",
  "system-admin.policies.manage": "/system-admin/policies",
  "system-admin.approvals.read": "/system-admin/approvals",
  "system-admin.approvals.manage": "/system-admin/approvals",
  "system-admin.settings.read": "/system-admin/organization",
  "system-admin.settings.write": "/system-admin/organization",
  "system-admin.audit.read": "/system-admin/audit",
  "system-admin.audit.review": "/system-admin/audit",
  "system-admin.audit.export": "/system-admin/audit",
  "system-admin.security.read": "/system-admin/security",
  "system-admin.security.manage": "/system-admin/security",
  "system-admin.organization.read": "/system-admin/organization",
  "system-admin.organization.manage": "/system-admin/organization",
  "system-admin.integrations.read": "/system-admin/integrations",
  "system-admin.integrations.write": "/system-admin/integrations",
  "system-admin.lynx.read": "/system-admin/lynx",
  "system-admin.lynx.approve": "/system-admin/lynx",
  "system-admin.reliability.read": "/system-admin/reliability",
  "system-admin.billing.read": "/system-admin/billing",
  "system-admin.billing.manage": "/system-admin/billing",
  "system-admin.billing.export": "/system-admin/billing",
  "system-admin.diagnostics.read": "/system-admin/diagnostics",
};

function titleCase(value: string) {
  return value
    .split(/[\s.-]+/g)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildCapabilityLabel(key: AppCapability) {
  const [moduleKey = key, ...segments] = key.split(".");
  const moduleDefinition = moduleById.get(moduleKey as ModuleId);

  if (segments.length === 1 && segments[0] === "view" && moduleDefinition) {
    return moduleDefinition.label;
  }

  return titleCase([moduleKey, ...segments].join(" "));
}

function buildCapabilityDescription(key: AppCapability) {
  const [moduleKey = key, ...segments] = key.split(".");
  const moduleDefinition = moduleById.get(moduleKey as ModuleId);

  if (segments.length === 1 && segments[0] === "view" && moduleDefinition) {
    return moduleDefinition.description;
  }

  return `Allows ${segments.join(" ")} access within ${titleCase(moduleKey)}.`;
}

function buildBuiltinExecutionCapability(
  requiredPermission: AppCapability,
): ExecutionCapability {
  const [moduleKey = requiredPermission] = requiredPermission.split(".");

  return {
    key: requiredPermission,
    moduleKey,
    label: buildCapabilityLabel(requiredPermission),
    description: buildCapabilityDescription(requiredPermission),
    route:
      routeByCapability[requiredPermission] ??
      moduleById.get(moduleKey as ModuleId)?.href,
    requiredPermission,
    auditArea: moduleKey,
    status: "active",
  };
}

const builtinExecutionCapabilities = appCapabilities.map(
  buildBuiltinExecutionCapability,
);

const builtinCapabilityMap = new Map<string, ExecutionCapability>(
  builtinExecutionCapabilities.map((capability) => [capability.key, capability]),
);

const customExecutionCapabilities = new Map<string, ExecutionCapability>();

export function defineExecutionCapability(
  capability: ExecutionCapability,
): ExecutionCapability {
  if (!isAppCapability(capability.requiredPermission)) {
    throw new ExecutionInvalidStateError(
      `Unknown permission in execution capability: ${capability.requiredPermission}`,
    );
  }

  if (
    builtinCapabilityMap.has(capability.key) ||
    customExecutionCapabilities.has(capability.key)
  ) {
    throw new ExecutionInvalidStateError(
      `Duplicate execution capability key: ${capability.key}`,
    );
  }

  customExecutionCapabilities.set(capability.key, capability);
  return capability;
}

export function defineExecutionCapabilities(
  capabilities: readonly ExecutionCapability[],
) {
  return capabilities.map(defineExecutionCapability);
}

export function resetExecutionCapabilityRegistryForTest() {
  customExecutionCapabilities.clear();
}

export function getExecutionCapability(key: string) {
  return (
    customExecutionCapabilities.get(key) ?? builtinCapabilityMap.get(key) ?? null
  );
}

export function requireExecutionCapability(key: string) {
  const capability = getExecutionCapability(key);

  if (!capability) {
    throw new ExecutionCapabilityNotFoundError(key);
  }

  return capability;
}

export function listExecutionCapabilities() {
  return [...builtinExecutionCapabilities, ...customExecutionCapabilities.values()];
}

export function listExecutionCapabilitiesForModule(moduleKey: string) {
  return listExecutionCapabilities().filter(
    (capability) => capability.moduleKey === moduleKey,
  );
}
