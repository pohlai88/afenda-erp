import "server-only"

import { revalidatePath } from "next/cache"

import { requireErpPermission } from "@afenda/platform/erp/rbac.server"
import { ORG_APPS_HRM_LMS } from "@afenda/platform/org-apps-module-paths"
import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"
import type { OrgSession } from "@afenda/platform/auth"

import { requireHrmOrgTenantFromForm } from "../../../_core/governance"
import { hrmActionFailure } from "../../../_core/governance"

import type { LmsMutationFormState } from "./lms.types.shared"

export const LMS_ERP_PERMISSION = {
  module: "hrm",
  object: "lms",
} as const

export function revalidateLmsPage() {
  revalidatePath(toLocaleOrgAppsRevalidatePattern(ORG_APPS_HRM_LMS), "page")
}

export async function requireLmsFormPermission(
  formData: FormData,
  fn: "create" | "update" | "audit"
): Promise<
  | { ok: true; session: OrgSession; orgSlug: string }
  | { ok: false; response: LmsMutationFormState }
> {
  const tenant = await requireHrmOrgTenantFromForm(formData)
  if (!tenant.ok) return { ok: false, response: tenant.response }

  const permission = await requireErpPermission({
    ...LMS_ERP_PERMISSION,
    function: fn,
  })
  if (!permission.ok) {
    return { ok: false, response: hrmActionFailure({ form: permission.error }) }
  }

  return { ok: true, session: permission.session, orgSlug: tenant.orgSlug }
}
