"use client"

import { useActionState } from "react"
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

import {
  addSuccessionPoolMemberAction,
  createSuccessionTalentPoolAction,
} from "../actions/succession-pool.actions"
import { HRM_SUCCESSION_POOL_KINDS } from "../schemas/succession-workflow-state.shared"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"
import type {
  SuccessionEmployeeChoiceRow,
  SuccessionTalentPoolRow,
} from "../data/succession.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function SuccessionTalentPoolFormDialog() {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(createSuccessionTalentPoolAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createTalentPool")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTalentPoolTitle")}</DialogTitle>
          <DialogDescription>{t("createTalentPoolDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="succession-pool-code">{t("fieldCode")}</FieldLabel>
            <Input id="succession-pool-code" name="code" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-pool-name">{t("fieldName")}</FieldLabel>
            <Input id="succession-pool-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-pool-kind">{t("fieldPoolKind")}</FieldLabel>
            <select
              id="succession-pool-kind"
              name="poolKind"
              defaultValue="high_potential"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_POOL_KINDS.map((value) => (
                <option key={value} value={value}>
                  {t(`poolKindLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-pool-description">{t("fieldDescription")}</FieldLabel>
            <Textarea id="succession-pool-description" name="description" rows={2} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveTalentPool")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type SuccessionPoolMemberFormProps = {
  pools: readonly SuccessionTalentPoolRow[]
  employeeChoices: readonly SuccessionEmployeeChoiceRow[]
}

export function SuccessionPoolMemberForm({
  pools,
  employeeChoices,
}: SuccessionPoolMemberFormProps) {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(addSuccessionPoolMemberAction, undefined)

  const error = state && !state.ok ? state.errors : null

  if (pools.length === 0 || employeeChoices.length === 0) return null

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <Field>
        <FieldLabel htmlFor="succession-pool-member-pool">{t("fieldTalentPool")}</FieldLabel>
        <select
          id="succession-pool-member-pool"
          name="poolId"
          required
          className={SELECT_CLASS}
          defaultValue={pools[0]?.id}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.name}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="succession-pool-member-employee">{t("fieldEmployee")}</FieldLabel>
        <select
          id="succession-pool-member-employee"
          name="employeeId"
          required
          className={SELECT_CLASS}
          defaultValue={employeeChoices[0]?.id}
        >
          {employeeChoices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
        </select>
      </Field>
      {error?.form ? <FieldError>{error.form}</FieldError> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("addPoolMember")}
      </Button>
    </form>
  )
}
