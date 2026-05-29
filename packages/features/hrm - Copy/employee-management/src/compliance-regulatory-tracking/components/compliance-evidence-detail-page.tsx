import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { z } from "zod"

import type { Route } from "next"

import Link from "next/link"
import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"
import { Button } from "@afenda/ui/button"
import { Separator } from "@afenda/ui/separator"
import { requireOrgSession } from "@afenda/platform/auth"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import { listComplianceEvidenceTimeline } from "../data/compliance-timeline.queries.server"
import { authorityForStatutoryPack } from "../data/statutory-event-types.shared"

import { ComplianceEvidenceSummaryListSection } from "./compliance-evidence-summary-list-section"
import { ComplianceEvidenceTimeline } from "./compliance-evidence-timeline"

type ComplianceEvidenceDetailPageProps = {
  orgSlug: string
  evidenceId: string
}

/**
 * Phase 3K ÔÇö Compliance evidence drill-down surface.
 *
 * Tier A authority owned here (route file stays thin). Composes:
 *   1. UUID guard on `evidenceId` -> notFound() before DB
 *   2. requireOrgSession() -> Tier A blocking authority
 *   3. listComplianceEvidenceTimeline() -> single read (joins all 3 truth
 *      sources internally), returns null when row missing in this tenant
 *   4. Summary card (state + key facts) + Timeline card (chronology)
 *
 * The full lifecycle (generation -> submission -> delivery -> retry ->
 * acknowledgement -> regeneration -> export) renders top-to-bottom ÔÇö this
 * is the artifact HR shows during a regulator inspection.
 */
export async function ComplianceEvidenceDetailPage({
  orgSlug,
  evidenceId,
}: ComplianceEvidenceDetailPageProps) {
  const idParsed = z.string().uuid().safeParse(evidenceId)
  if (!idParsed.success) {
    notFound()
  }

  const { organizationId } = await requireOrgSession()
  const result = await listComplianceEvidenceTimeline({
    organizationId,
    evidenceId: idParsed.data,
  })
  if (!result) {
    notFound()
  }
  const { evidence, entries } = result

  const [t, format] = await Promise.all([getTranslations(), getFormatter()])

  const listHref = organizationHrmPath(orgSlug, "compliance")
  const generatedLabel = format.dateTime(evidence.generatedAt, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const acknowledgedLabel = evidence.acknowledgedAt
    ? format.dateTime(evidence.acknowledgedAt, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null
  const authorityName = authorityForStatutoryPack(evidence.packType)
  const acknowledgementSourceLabel = evidence.acknowledgementSource
    ? ({
        manual: t("Erp.Hrm.compliance.acknowledgementSource.manual"),
        webhook: t("Erp.Hrm.compliance.acknowledgementSource.webhook"),
        api: t("Erp.Hrm.compliance.acknowledgementSource.api"),
        import: t("Erp.Hrm.compliance.acknowledgementSource.import"),
      }[evidence.acknowledgementSource] ?? "—")
    : "—"

  const summaryRows = [
    {
      id: "generated-at",
      field: t("Erp.Hrm.compliance.timeline.fieldGeneratedAt"),
      value: generatedLabel,
    },
    {
      id: "rule-pack-version",
      field: t("Erp.Hrm.compliance.timeline.fieldRulePackVersion"),
      value: evidence.rulePackVersion,
    },
    {
      id: "input-hash",
      field: t("Erp.Hrm.compliance.timeline.fieldInputHash"),
      value: evidence.inputHash,
    },
    {
      id: "output-hash",
      field: t("Erp.Hrm.compliance.timeline.fieldOutputHash"),
      value: evidence.outputHash,
    },
    {
      id: "external-reference",
      field: t("Erp.Hrm.compliance.timeline.fieldExternalReference"),
      value: evidence.externalReference ?? "—",
    },
    {
      id: "acknowledged-at",
      field: t("Erp.Hrm.compliance.timeline.fieldAcknowledgedAt"),
      value: acknowledgedLabel ?? "—",
    },
    {
      id: "acknowledgement-source",
      field: t("Erp.Hrm.compliance.timeline.fieldAcknowledgementSource"),
      value: acknowledgementSourceLabel,
    },
    {
      id: "authority-payload-hash",
      field: t("Erp.Hrm.compliance.timeline.fieldAuthorityPayloadHash"),
      value: evidence.authorityPayloadHash ?? "—",
    },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={listHref as Route}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("Erp.Hrm.compliance.timeline.backToCompliance")}
        </Link>
        <ModulePageHeader
          eyebrow={t("Erp.Hrm.compliance.eyebrow")}
          title={t("Erp.Hrm.compliance.timeline.detailTitle")}
          description={t("Erp.Hrm.compliance.timeline.detailDescription")}
        />
      </div>

      <Card size="sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{evidence.packType}</CardTitle>
            <SubmissionStateBadge state={evidence.submissionState} />
            {authorityName ? (
              <Badge variant="outline">{authorityName}</Badge>
            ) : null}
          </div>
          <CardDescription>
            {t("Erp.Hrm.compliance.timeline.summaryDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ComplianceEvidenceSummaryListSection rows={summaryRows} />
          <ExportRow evidenceId={evidence.id} />
        </CardContent>
      </Card>

      <Separator />

      <ComplianceEvidenceTimeline
        entries={entries}
        packType={evidence.packType}
      />
    </div>
  )
}

/**
 * Compact submission state badge ÔÇö mirrors `SubmissionBadge` in
 * `compliance-statutory-pack-controls.client.tsx` but without dragging the larger row's chrome in.
 * Stays read-only; the manual acknowledge form lives on the index page.
 */
function SubmissionStateBadge({ state }: { state: string }) {
  if (state === "acknowledged") {
    return <Badge>{state}</Badge>
  }
  if (state === "failed") {
    return <Badge variant="destructive">{state}</Badge>
  }
  if (state === "submitted") {
    return <Badge variant="secondary">{state}</Badge>
  }
  return <Badge variant="outline">{state}</Badge>
}

/**
 * Phase 3R ÔÇö Operator-friendly export row (JSON / CSV download).
 *
 * The two anchors point at the existing
 * `app/api/integrations/hrm-statutory-pack-export/[evidenceId]` route
 * handler, which re-derives the canonical pack on demand, verifies hash
 * parity with the stored evidence row, audits the download as
 * `erp.hrm.compliance_pack.export`, and stamps the response body with
 * `X-Afenda-Pack-Hash: sha256=<hex>` for tamper-evident offline review.
 *
 * Plain `<a>` (wrapped via `Button asChild`) is intentional ÔÇö the response
 * carries `Content-Disposition: attachment`, so the browser handles the
 * download natively without client-side navigation. The `download`
 * attribute is a defense-in-depth hint for the browser.
 */
async function ExportRow({ evidenceId }: { evidenceId: string }) {
  const t = await getTranslations("Erp.Hrm.compliance.timeline.export")
  const jsonHref = `/api/integrations/hrm-statutory-pack-export/${evidenceId}?format=json`
  const csvHref = `/api/integrations/hrm-statutory-pack-export/${evidenceId}?format=csv`
  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{t("label")}</span>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={jsonHref} download>
              {t("json")}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={csvHref} download>
              {t("csv")}
            </a>
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("description")}</p>
    </div>
  )
}
