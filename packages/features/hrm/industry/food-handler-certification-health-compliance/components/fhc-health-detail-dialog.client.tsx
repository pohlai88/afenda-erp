"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@afenda/ui/badge"
import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"

import type { FhcHealthRecordRow } from "../data/fhc.types.shared"
import { FHC_HEALTH_REDACTED_LABEL } from "../data/fhc-health-redaction.shared"
import type { HrmFhcRenewalState } from "../schemas/fhc-workflow-state.shared"

type FhcHealthDetailDialogProps = {
  record: FhcHealthRecordRow
  canReadHealthDetails: boolean
}

export function FhcHealthDetailDialog({
  record,
  canReadHealthDetails,
}: FhcHealthDetailDialogProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const refRestricted =
    !canReadHealthDetails &&
    record.certificateRefDisplay === FHC_HEALTH_REDACTED_LABEL

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("viewHealthDetail")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("healthDetailTitle")}</DialogTitle>
          <DialogDescription>{record.employeeLabel}</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{t("colStatus")}</dt>
            <dd>
              <Badge variant="secondary">{record.healthStatus}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{t("colRenewal")}</dt>
            <dd>
              <Badge variant="outline">
                {t(
                  `renewalStateLabels.${record.renewalState as HrmFhcRenewalState}` as `renewalStateLabels.${HrmFhcRenewalState}`
                )}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{t("fieldIssueDate")}</dt>
            <dd>{record.issuedAt ?? t("notRecorded")}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{t("fieldExpiryDate")}</dt>
            <dd>{record.expiresAt ?? t("notRecorded")}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              {t("fieldCertificateRef")}
            </dt>
            <dd className="font-mono text-xs">
              {record.certificateRefDisplay ?? t("notRecorded")}
            </dd>
            {refRestricted ? (
              <p className="text-xs text-muted-foreground">
                {t("healthDetailRefRestricted")}
              </p>
            ) : null}
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
