import { getTranslations } from "next-intl/server"

import { GovernedSection } from "@afenda/governed-surface/server"
import { Button } from "@afenda/ui/button"
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"

import { upsertComplianceObligationFormAction } from "../actions/compliance-obligation.actions"
import { HRM_COMPLIANCE_EXCEPTION_AREAS } from "../data/compliance-status.shared"
import { HRM_COMPLIANCE_OBLIGATION_KINDS } from "../data/compliance-obligation.shared"

type ComplianceObligationsRegisterSectionProps = {
  orgSlug: string
  canCreate: boolean
}

function formatOptionLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function ComplianceObligationsRegisterSection({
  orgSlug,
  canCreate,
}: ComplianceObligationsRegisterSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.obligations")

  if (!canCreate) {
    return (
      <p className="text-sm text-muted-foreground">{t("readOnlyRegister")}</p>
    )
  }

  return (
    <GovernedSection
      title={t("registerTitle")}
      description={t("registerDescription")}
    >
      <form
        action={upsertComplianceObligationFormAction}
        data-testid="hrm-compliance-obligation-register-form"
      >
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <FieldGroup className="grid gap-4 @md/field-group:grid-cols-2 @xl/field-group:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="obligation-code">{t("fieldCode")}</FieldLabel>
            <Input id="obligation-code" name="code" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="obligation-title">
              {t("fieldTitle")}
            </FieldLabel>
            <Input id="obligation-title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="obligation-kind">{t("fieldKind")}</FieldLabel>
            <select
              id="obligation-kind"
              name="requirementKind"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="policy_acknowledgement"
            >
              {HRM_COMPLIANCE_OBLIGATION_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {formatOptionLabel(kind)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="obligation-area">{t("fieldArea")}</FieldLabel>
            <select
              id="obligation-area"
              name="complianceArea"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="acknowledgement"
            >
              {HRM_COMPLIANCE_EXCEPTION_AREAS.map((area) => (
                <option key={area} value={area}>
                  {formatOptionLabel(area)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="obligation-country">
              {t("fieldCountry")}
            </FieldLabel>
            <Input
              id="obligation-country"
              name="countryCode"
              placeholder="MY"
              maxLength={2}
              className="uppercase"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="obligation-entity">
              {t("fieldLegalEntity")}
            </FieldLabel>
            <Input id="obligation-entity" name="legalEntityCode" />
          </Field>
          <Field className="@md/field-group:col-span-2 @xl/field-group:col-span-3">
            <Button
              type="submit"
              size="sm"
              data-testid="hrm-compliance-obligation-save"
            >
              {t("saveSubmit")}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </GovernedSection>
  )
}
