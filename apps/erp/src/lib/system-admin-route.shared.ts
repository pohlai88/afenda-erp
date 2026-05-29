import { notFound } from "next/navigation";

export const SYSTEM_ADMIN_MODULE_ID = "system-admin" as const;

export type SystemAdminModuleId = typeof SYSTEM_ADMIN_MODULE_ID;

export function assertSystemAdminModuleId(
  moduleId: string,
): asserts moduleId is SystemAdminModuleId {
  if (moduleId !== SYSTEM_ADMIN_MODULE_ID) {
    notFound();
  }
}
