"use client"

import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { Input } from "@afenda/ui/input"

import { reviewOffboardingApprovalFormAction } from "../actions/offboarding.actions"
import type { OffboardingSurfaceCapabilities } from "../data/offboarding-capabilities.shared"

export type OffboardingApprovalActionsProps = {
  orgSlug: string
  employeeId: string
  instanceId: string
  capabilities: OffboardingSurfaceCapabilities
}

export function OffboardingApprovalActions({
  orgSlug,
  employeeId,
  instanceId,
  capabilities,
}: OffboardingApprovalActionsProps) {
  const t = useTranslations("Erp.Hrm.offboarding")

  if (!capabilities.canUpdate) {
    return (
      <span className="text-xs text-muted-foreground">
        {t("readOnlyApproval")}
      </span>
    )
  }

  return (
    <div className="flex min-w-[14rem] flex-col gap-2">
      <form
        action={reviewOffboardingApprovalFormAction}
        className="flex flex-col gap-1"
      >
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="instanceId" value={instanceId} />
        <input type="hidden" name="decision" value="approved" />
        <Input
          name="reviewNote"
          placeholder={t("approvalNotePlaceholder")}
          className="h-8 text-xs"
        />
        <Button type="submit" size="sm" variant="secondary">
          {t("approveSubmit")}
        </Button>
      </form>
      <form
        action={reviewOffboardingApprovalFormAction}
        className="flex flex-col gap-1"
      >
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="instanceId" value={instanceId} />
        <input type="hidden" name="decision" value="rejected" />
        <Button type="submit" size="sm" variant="outline">
          {t("rejectSubmit")}
        </Button>
      </form>
    </div>
  )
}
