import { requireSystemAdminCapability } from "../../overview/policies/system-admin.capability.policy.server";

export function requireSystemAdminLynxRead() {
  return requireSystemAdminCapability("system-admin.lynx.read");
}

export function requireSystemAdminLynxApprove() {
  return requireSystemAdminCapability("system-admin.lynx.approve");
}
