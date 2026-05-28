import { getFormatter, getTranslations } from "next-intl/server"

import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import {
  hrmDocumentTypeLabelKey,
  isHrmDocumentClassification,
  isHrmDocumentType,
  isHrmDocumentVerificationStatus,
} from "../data/hrm-document-display.shared"
import { buildDocumentsListSurfaceConfiguration } from "../data/documents-list-surface.server"
import {
  type OrgHrmDocumentRow,
  listHrmDocumentsForOrg,
} from "../data/hrm-document.queries.server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { DocumentsLibraryTrailingCell } from "./documents-library-trailing-cell.client"

type DocumentsLibraryProps = {
  orgSlug: string
  documentType: string | null
  classification: string | null
  employeeId: string | null
  canDownload: boolean
  canReview: boolean
}

function documentsListCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Erp.Hrm.documents">>>,
  format: Awaited<ReturnType<typeof getFormatter>>,
  hasFilter: boolean
) {
  return {
    empty: hasFilter ? t("filteredEmptyTitle") : t("noDocumentsTitle"),
    colTitle: t("colTitle"),
    colType: t("colType"),
    colEmployee: t("colEmployee"),
    colClassification: t("colClassification"),
    colVerification: t("colVerification"),
    colSize: t("colSize"),
    colUploadedAt: t("colUploadedAt"),
    colHash: t("colHash"),
    noEmployeeBadge: t("noEmployeeBadge"),
    typeLabelFor: (documentTypeValue: string) =>
      isHrmDocumentType(documentTypeValue)
        ? t(hrmDocumentTypeLabelKey(documentTypeValue))
        : documentTypeValue,
    classificationLabelFor: (classificationValue: string) =>
      isHrmDocumentClassification(classificationValue)
        ? t(`documentClassifications.${classificationValue}`)
        : classificationValue,
    verificationLabelFor: (status: string) =>
      isHrmDocumentVerificationStatus(status)
        ? t(`verificationStatuses.${status}`)
        : status,
    formatUploadedAt: (date: Date) =>
      format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
  }
}

export async function DocumentsLibrary({
  orgSlug,
  documentType,
  classification,
  employeeId,
  canDownload,
  canReview,
}: DocumentsLibraryProps) {
  const orgSession = await requireOrgSession()
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.documents"),
    getFormatter(),
  ])

  const hasFilter =
    documentType !== null || classification !== null || employeeId !== null
  const copy = documentsListCopy(t, format, hasFilter)
  const trailingContext = {
    showActionsColumn: canDownload || canReview,
    canDownload,
    canReview,
  }

  let rows: OrgHrmDocumentRow[]
  try {
    rows = await listHrmDocumentsForOrg(orgSession.organizationId, {
      documentType: documentType ?? undefined,
      classification: classification ?? undefined,
      employeeId: employeeId ?? undefined,
    })
  } catch (err) {
    logUnexpectedServerError("documents-library: query failed", err, {
      organizationId: orgSession.organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildDocumentsListSurfaceConfiguration(
          [],
          orgSlug,
          copy,
          trailingContext
        )}
        surfaceKey="hrm:documents:library:error"
        loadError={{
          variant: "error",
          title: t("libraryLoadFailed"),
        }}
      />
    )
  }

  const listConfiguration = buildDocumentsListSurfaceConfiguration(
    rows,
    orgSlug,
    copy,
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:documents:library"
      contentBeforeList={
        rows.length > 0 ? (
          <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
            {hasFilter
              ? t("filteredCount", { count: rows.length })
              : t("totalCount", { count: rows.length })}
          </p>
        ) : null
      }
      trailingColumn={
        trailingContext.showActionsColumn
          ? {
              header: t("colActions"),
              Cell: DocumentsLibraryTrailingCell,
              context: {
                orgSlug,
                canReview,
                canDownload,
                downloadLabel: t("download"),
                rows: rows.map((row) => ({
                  id: row.id,
                  verificationStatus: row.verificationStatus,
                })),
              },
            }
          : undefined
      }
    />
  )
}
