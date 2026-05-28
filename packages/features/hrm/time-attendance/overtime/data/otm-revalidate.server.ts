import "server-only"

import { revalidatePath } from "next/cache"

import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"

export function revalidateOtmSurfaces() {
  revalidatePath(toLocaleOrgAppsRevalidatePattern("/hrm/overtime"), "layout")
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern("/hrm/employees/[employeeId]"),
    "page"
  )
}
