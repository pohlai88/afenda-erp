import "server-only"

import { revalidatePath } from "next/cache"

import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"

export function revalidateSftSurfaces() {
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern("/hrm/shift-scheduling"),
    "page"
  )
  revalidatePath(toLocaleOrgAppsRevalidatePattern("/hrm/attendance"), "layout")
}
