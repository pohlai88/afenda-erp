import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import type { HrmDocumentSummary } from "../../../_core/shared"
import { isHrmDocumentType } from "../../documents-management/data/hrm-document-display.shared"
import { buildEmployeeDocumentVaultListSurfaceConfiguration } from "../data/employee-document-vault-list-surface.server"

import { EmployeeDocumentVaultTrailingCell } from "./employee-document-vault-trailing-cell.client"

type EmployeeDocumentVaultListSectionProps = {
  documents: readonly HrmDocumentSummary[]
  canDownload: boolean
  openLabel: string
}

export async function EmployeeDocumentVaultListSection({
  documents,
  canDownload,
  openLabel,
}: EmployeeDocumentVaultListSectionProps) {
  const [t, tDocuments, tDocumentTypes, format] = await Promise.all([
    getTranslations("Erp.Hrm.workforce"),
    getTranslations("Erp.Hrm.documents"),
    getTranslations("Erp.Hrm.workforce.documentTypes"),
    getFormatter(),
  ])

  const listConfiguration = buildEmployeeDocumentVaultListSurfaceConfiguration(
    documents,
    {
      empty: t("documentVaultEmpty"),
      colTitle: tDocuments("colTitle"),
      colType: tDocuments("colType"),
      colUploaded: tDocuments("colUploadedAt"),
      typeLabelFor: (documentType) =>
        isHrmDocumentType(documentType)
          ? tDocumentTypes(documentType)
          : documentType,
      formatUploadedAt: (value) =>
        format.dateTime(value, { dateStyle: "medium", timeStyle: "short" }),
    },
    { canDownload }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:employee:document-vault"
      trailingColumn={{
        header: " ",
        Cell: EmployeeDocumentVaultTrailingCell,
        context: {
          openLabel,
          documents: documents.map((doc) => ({
            id: doc.id,
            blobUrl: doc.blobUrl,
          })),
        },
      }}
    />
  )
}
