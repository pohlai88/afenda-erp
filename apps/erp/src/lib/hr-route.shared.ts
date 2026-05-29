import { notFound } from "next/navigation";

export const HR_MODULE_ID = "hr" as const;

export type HrModuleId = typeof HR_MODULE_ID;

export function assertHrModuleId(moduleId: string): asserts moduleId is HrModuleId {
  if (moduleId !== HR_MODULE_ID) {
    notFound();
  }
}
