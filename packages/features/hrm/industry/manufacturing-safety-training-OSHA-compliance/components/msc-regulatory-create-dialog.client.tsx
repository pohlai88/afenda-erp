"use client"

import { useActionState, useId } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import { Textarea } from "@afenda/ui/textarea"

import { createMscRegulatoryReferenceAction } from "../actions/msc-compliance.actions"
import type { CreateMscRegulatoryReferenceFormState } from "../data/msc-form-state.shared"
import type {
  MscRequirementRuleRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import { HRM_MSC_REGULATORY_FRAMEWORKS } from "../schemas/msc-workflow-state.shared"
import type { HrmMscRegulatoryFramework } from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function MscRegulatoryCreateDialog({
  sites,
  requirementRules,
}: {
  sites: readonly MscSiteChoiceRow[]
  requirementRules: readonly MscRequirementRuleRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const frameworkFieldId = useId()
  const siteFieldId = useId()
  const ruleFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscRegulatoryReferenceFormState | undefined,
    FormData
  >(createMscRegulatoryReferenceAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createRegulatoryReference")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createRegulatoryReferenceTitle")}</DialogTitle>
          <DialogDescription>
            {t("createRegulatoryReferenceDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={frameworkFieldId}>
              {t("colFramework")}
            </FieldLabel>
            <select
              id={frameworkFieldId}
              name="framework"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_REGULATORY_FRAMEWORKS.map((framework) => (
                <option key={framework} value={framework}>
                  {t(
                    `regulatoryFrameworkLabels.${framework as HrmMscRegulatoryFramework}`
                  )}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-reg-code">
              {t("colReferenceCode")}
            </FieldLabel>
            <Input id="msc-reg-code" name="referenceCode" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-reg-label">
              {t("colReferenceLabel")}
            </FieldLabel>
            <Input
              id="msc-reg-label"
              name="referenceLabel"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={siteFieldId}>{t("fieldSite")}</FieldLabel>
            <select
              id={siteFieldId}
              name="siteId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anySite")}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code} · {site.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={ruleFieldId}>
              {t("fieldRequirementRule")}
            </FieldLabel>
            <select
              id={ruleFieldId}
              name="requirementRuleId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anyRequirementRule")}</option>
              {requirementRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.siteLabel ?? t("anySite")} ·{" "}
                  {rule.roleRef ?? t("anyCriteria")}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-reg-notes">{t("colNotes")}</FieldLabel>
            <Textarea
              id="msc-reg-notes"
              name="notes"
              rows={3}
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveRegulatoryReference")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
