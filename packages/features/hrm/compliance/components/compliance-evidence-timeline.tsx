import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import type {
  ComplianceTimelineEntry,
  ComplianceTimelineKind,
} from "../data/compliance-timeline.shared"
import { buildComplianceEvidenceTimelineListSurfaceConfiguration } from "../data/compliance-evidence-timeline-list-surface.server"

type ComplianceEvidenceTimelineProps = {
  entries: ComplianceTimelineEntry[]
  packType: string | null
}

function shortId(value: string | null | undefined): string | null {
  if (!value) return null
  return value.length <= 12 ? value : `${value.slice(0, 8)}…`
}

export async function ComplianceEvidenceTimeline({
  entries,
  packType,
}: ComplianceEvidenceTimelineProps) {
  const t = await getTranslations()

  const timelineKindLabels: Record<ComplianceTimelineKind, string> = {
    generated: t("Erp.Hrm.compliance.timeline.kind.generated"),
    submitted_to_bureau: t(
      "Erp.Hrm.compliance.timeline.kind.submitted_to_bureau"
    ),
    delivery_failed: t("Erp.Hrm.compliance.timeline.kind.delivery_failed"),
    retry_attempted: t("Erp.Hrm.compliance.timeline.kind.retry_attempted"),
    retry_exhausted: t("Erp.Hrm.compliance.timeline.kind.retry_exhausted"),
    aging_detected: t("Erp.Hrm.compliance.timeline.kind.aging_detected"),
    aging_escalated: t("Erp.Hrm.compliance.timeline.kind.aging_escalated"),
    aging_critical: t("Erp.Hrm.compliance.timeline.kind.aging_critical"),
    acknowledged: t("Erp.Hrm.compliance.timeline.kind.acknowledged"),
    pack_exported: t("Erp.Hrm.compliance.timeline.kind.pack_exported"),
    regenerated: t("Erp.Hrm.compliance.timeline.kind.regenerated"),
  }

  const facetLabels = {
    attempts: t("Erp.Hrm.compliance.timeline.facet.attempts"),
    httpStatus: t("Erp.Hrm.compliance.timeline.facet.httpStatus"),
    durationMs: t("Erp.Hrm.compliance.timeline.facet.durationMs"),
    authority: t("Erp.Hrm.compliance.timeline.facet.authority"),
    externalReference: t("Erp.Hrm.compliance.timeline.facet.externalReference"),
    authorityPayloadHash: t(
      "Erp.Hrm.compliance.timeline.facet.authorityPayloadHash"
    ),
    inputHash: t("Erp.Hrm.compliance.timeline.facet.inputHash"),
    outputHash: t("Erp.Hrm.compliance.timeline.facet.outputHash"),
    packType: t("Erp.Hrm.compliance.timeline.facet.packType"),
    countryCode: t("Erp.Hrm.compliance.timeline.facet.countryCode"),
    rulePackVersion: t("Erp.Hrm.compliance.timeline.facet.rulePackVersion"),
    retryReason: t("Erp.Hrm.compliance.timeline.facet.retryReason"),
    ageDays: t("Erp.Hrm.compliance.timeline.facet.ageDays"),
    stuckThresholdDays: t(
      "Erp.Hrm.compliance.timeline.facet.stuckThresholdDays"
    ),
    tierThresholdDays: t("Erp.Hrm.compliance.timeline.facet.tierThresholdDays"),
    severityTier: t("Erp.Hrm.compliance.timeline.facet.severityTier"),
    format: t("Erp.Hrm.compliance.timeline.facet.format"),
    responseHash: t("Erp.Hrm.compliance.timeline.facet.responseHash"),
    priorInputHash: t("Erp.Hrm.compliance.timeline.facet.priorInputHash"),
    priorOutputHash: t("Erp.Hrm.compliance.timeline.facet.priorOutputHash"),
    priorRulePackVersion: t(
      "Erp.Hrm.compliance.timeline.facet.priorRulePackVersion"
    ),
    priorSubmissionState: t(
      "Erp.Hrm.compliance.timeline.facet.priorSubmissionState"
    ),
    priorExternalReference: t(
      "Erp.Hrm.compliance.timeline.facet.priorExternalReference"
    ),
    priorAcknowledgedAt: t(
      "Erp.Hrm.compliance.timeline.facet.priorAcknowledgedAt"
    ),
  }

  const listConfiguration =
    buildComplianceEvidenceTimelineListSurfaceConfiguration(entries, packType, {
      empty: t("Erp.Hrm.compliance.timeline.empty"),
      colKind: t("Erp.Hrm.compliance.timeline.colKind"),
      colWhen: t("Erp.Hrm.compliance.timeline.colWhen"),
      colActor: t("Erp.Hrm.compliance.timeline.actorLabel"),
      colDetails: t("Erp.Hrm.compliance.timeline.colDetails"),
      kindLabelFor: (kind) => timelineKindLabels[kind],
      actorLabelFor: (entry) =>
        entry.actorEmail?.trim() ||
        shortId(entry.actorUserId) ||
        t("Erp.Hrm.compliance.timeline.actorSystem"),
      facetLabels,
    })

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">
          {t("Erp.Hrm.compliance.timeline.title")}
        </CardTitle>
        <CardDescription>
          {t("Erp.Hrm.compliance.timeline.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey="hrm:compliance:evidence-timeline"
          resolveConfiguredPermission={false}
        />
      </CardContent>
    </Card>
  )
}
