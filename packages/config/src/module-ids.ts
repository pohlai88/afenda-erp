export const moduleIds = [
  "dashboard",
  "finance",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "crm",
  "approvals",
  "reports",
  "system-admin",
] as const;

export type ModuleId = (typeof moduleIds)[number];

export const coreModuleIds = [
  "finance",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "crm",
  "approvals",
  "reports",
  "system-admin",
] as const satisfies readonly ModuleId[];

export const documentExtractionModuleIds = coreModuleIds;

export const approvalToolModuleIds = [
  "approvals",
  "finance",
  "purchasing",
  "hr",
  "system-admin",
] as const satisfies readonly ModuleId[];

export function isModuleId(value: string): value is ModuleId {
  return (moduleIds as readonly string[]).includes(value);
}
