import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listComplianceExceptionsForOrg } from "../data/compliance-exception.queries.server"
import type { ComplianceSurfaceCapabilities } from "../data/compliance-capabilities.shared"

import { ComplianceExceptionsListSection } from "./compliance-exceptions-list-section"

type ComplianceExceptionsPanelProps = {
  organizationId: string
  orgSlug: string
  capabilities: ComplianceSurfaceCapabilities
  workbenchFocus?: string | null
}

export async function ComplianceExceptionsPanel({
  organizationId,
  orgSlug,
  capabilities,
  workbenchFocus,
}: ComplianceExceptionsPanelProps) {
  const [t, rows] = await Promise.all([
    getTranslations("Erp.Hrm.compliance.exceptions"),
    listComplianceExceptionsForOrg(organizationId),
  ])

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ComplianceExceptionsListSection
          orgSlug={orgSlug}
          canUpdate={capabilities.canUpdate}
          rows={rows}
          workbenchFocus={workbenchFocus}
        />
      </CardContent>
    </Card>
  )
}
