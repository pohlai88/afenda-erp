import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { getOrCreateRwsRetailSchedulingPolicy } from "../data/rws-policy.server"
import { RwsPolicyForm } from "./rws-policy-form.client"

export async function RwsPolicySection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const policy = await getOrCreateRwsRetailSchedulingPolicy(organizationId)

  return (
    <Card size="sm" data-testid="rws-policy-section">
      <CardHeader>
        <CardTitle>{t("policyTitle")}</CardTitle>
        <CardDescription>{t("policyDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {canManage ? (
          <RwsPolicyForm policy={policy} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("policyReadOnly")}</p>
        )}
      </CardContent>
    </Card>
  )
}
