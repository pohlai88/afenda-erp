import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { LmsExportReportButton } from "./lms-export-report-button.client"
import {
  buildLmsReportsListSurfaceConfiguration,
  type LmsReportCatalogRow,
  type LmsReportsListCopy,
} from "../data/lms-reports-list-surface.server"
import { LMS_REPORTS_SURFACE_KEY } from "../lms-list-surface.shared"

export async function LmsReportsSection({
  catalogRows,
  title,
  description,
  labels,
  canExport,
  parentAccessAllowed = true,
}: {
  catalogRows: readonly LmsReportCatalogRow[]
  title: string
  description: string
  labels: LmsReportsListCopy
  canExport: boolean
  parentAccessAllowed?: boolean
}) {
  const listConfiguration = buildLmsReportsListSurfaceConfiguration(
    catalogRows,
    labels
  )

  return (
    <GovernedPatternBListSection
      title={title}
      description={description}
      surfaceKey={LMS_REPORTS_SURFACE_KEY}
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      headerAction={canExport ? <LmsExportReportButton /> : undefined}
    />
  )
}
