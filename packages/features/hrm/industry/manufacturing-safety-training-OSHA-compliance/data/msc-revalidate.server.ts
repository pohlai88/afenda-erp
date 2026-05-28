import "server-only"

import { revalidatePath } from "next/cache"

import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"

export function revalidateMscSurfaces() {
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern("/hrm/manufacturing-safety"),
    "page"
  )
}
