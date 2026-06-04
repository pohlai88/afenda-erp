import { requireSystemAdminCapability } from "../overview/sys-capability.policy.server";

export { requireSystemAdminBillingRead } from "../overview/sys-capability.policy.server";

export function requireSystemAdminBillingManage() {
  return requireSystemAdminCapability("system-admin.billing.manage");
}

export function requireSystemAdminBillingExport() {
  return requireSystemAdminCapability("system-admin.billing.export");
}
