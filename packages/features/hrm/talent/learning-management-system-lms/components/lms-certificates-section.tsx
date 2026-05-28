import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildLmsCertificatesListSurfaceConfiguration } from "../data/lms-certificates-list-surface.server"
import type { LmsCertificatesListCopy } from "../data/lms-certificates-list-surface.server"
import type { HrmLmsCertificateRow } from "../data/lms.types.shared"
import { LMS_CERTIFICATES_SURFACE_KEY } from "../lms-list-surface.shared"

import { LmsCertificateTrailingCell } from "./lms-certificate-trailing-cells.client"

type LmsCertificatesSectionProps = {
  certificates: readonly HrmLmsCertificateRow[]
  orgSlug: string
  organizationId: string
  canManage: boolean
  canRead: boolean
  renewAction: (formData: FormData) => void | Promise<void>
  labels: LmsCertificatesListCopy
}

export async function LmsCertificatesSection({
  certificates,
  orgSlug,
  organizationId,
  canManage,
  canRead,
  renewAction,
  labels,
}: LmsCertificatesSectionProps) {
  const listConfiguration = buildLmsCertificatesListSurfaceConfiguration(
    certificates,
    orgSlug,
    labels,
    { showTrailing: canManage }
  )

  return (
    <section
      id="lms-certificates-section"
      data-testid="lms-certificates-section"
    >
      <GovernedPatternCListSection
        title={labels.boardTitle}
        description={labels.boardDescription}
        listConfiguration={listConfiguration}
        surfaceKey={LMS_CERTIFICATES_SURFACE_KEY}
        cardClassName="mt-0"
        parentAccessAllowed={canRead}
        trailingColumn={
          canManage
            ? {
                header: "",
                Cell: LmsCertificateTrailingCell,
                context: {
                  organizationId,
                  orgSlug,
                  renewAction,
                  renewLabel: labels.renew,
                  certificates: certificates.map((row) => ({
                    id: row.id,
                    status: row.status,
                  })),
                },
              }
            : undefined
        }
      />
    </section>
  )
}
