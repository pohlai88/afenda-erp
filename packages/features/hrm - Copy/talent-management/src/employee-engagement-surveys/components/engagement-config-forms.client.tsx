"use client"

import { useActionState, useId } from "react"
import { useTranslations } from "next-intl"

import Link from "next/link"

import { Button } from "@afenda/ui/button"
import { Checkbox } from "@afenda/ui/checkbox"
import { Field, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"

import {
  revertEngagementSurveyToDraftAction,
  saveEngagementSurveyConfigurationAction,
  scheduleEngagementSurveyAction,
} from "../actions/engagement-survey-config.actions"
import { organizationHrmEmployeeEngagementSurveyPath } from "../employee-engagement-paths.shared"
import type { EngagementSurveyCycleOption } from "../data/engagement-cycle.queries.server"
import type {
  EngagementAudienceFilterOptions,
  EngagementSurveyConfigurationDetail,
} from "../schemas/engagement-config.shared"
import { DEFAULT_ENGAGEMENT_MIN_SEGMENT_RESPONSES } from "../schemas/engagement-anonymity.shared"
import type { EngagementAudienceFilter } from "../schemas/engagement-audience.shared"
import { HRM_ENGAGEMENT_ANONYMITY_MODES } from "../schemas/engagement-workflow.shared"

import { EngagementFormFeedback } from "./engagement-form-feedback.client"

function toDatetimeLocalValue(value: Date | null): string {
  if (!value) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

function filterSet(
  filter: EngagementAudienceFilter,
  key: keyof EngagementAudienceFilter
): Set<string> {
  const raw = filter[key]
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.map(String))
}

function AudienceCheckboxGroup({
  name,
  label,
  options,
  selected,
}: {
  name: string
  label: string
  options: ReadonlyArray<{ value: string; label: string }>
  selected: Set<string>
}) {
  const legendId = useId()
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No options in this org yet.
      </p>
    )
  }
  return (
    <fieldset className="flex flex-col gap-2" aria-labelledby={legendId}>
      <legend id={legendId} className="text-sm font-medium">
        {label}
      </legend>
      <div className="grid max-h-40 gap-2 overflow-y-auto sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              name={name}
              value={option.value}
              defaultChecked={selected.has(option.value)}
            />
            <span className="truncate">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type SurveyConfigFormProps = {
  survey: EngagementSurveyConfigurationDetail
  filterOptions: EngagementAudienceFilterOptions
  cycleOptions: readonly EngagementSurveyCycleOption[]
  canManage: boolean
}

export function SaveEngagementSurveyConfigurationForm({
  survey,
  filterOptions,
  cycleOptions,
  canManage,
}: SurveyConfigFormProps) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.config")
  const [state, action, pending] = useActionState(
    saveEngagementSurveyConfigurationAction,
    undefined
  )
  if (!canManage) {
    return <p className="text-sm text-muted-foreground">{t("readOnlyHint")}</p>
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="surveyId" value={survey.id} />
      <EngagementSurveyConfigurationFields
        survey={survey}
        filterOptions={filterOptions}
        cycleOptions={cycleOptions}
        t={t}
      />
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending}>
        {t("saveConfiguration")}
      </Button>
    </form>
  )
}

export function ScheduleEngagementSurveyForm({
  survey,
  filterOptions,
  cycleOptions,
  canManage,
}: SurveyConfigFormProps) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.config")
  const [state, action, pending] = useActionState(
    scheduleEngagementSurveyAction,
    undefined
  )

  if (!canManage) return null
  if (survey.state !== "draft") {
    return (
      <p className="text-sm text-muted-foreground">{t("scheduleOnlyDraft")}</p>
    )
  }
  if (survey.questionCount < 1) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("scheduleNeedsQuestions")}
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="surveyId" value={survey.id} />
      <EngagementSurveyConfigurationFields
        survey={survey}
        filterOptions={filterOptions}
        cycleOptions={cycleOptions}
        t={t}
        requireScheduleDates
      />
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending}>
        {t("scheduleSurvey")}
      </Button>
    </form>
  )
}

export function RevertEngagementSurveyToDraftForm({
  survey,
  canManage,
}: {
  survey: EngagementSurveyConfigurationDetail
  canManage: boolean
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.config")
  const [state, action, pending] = useActionState(
    revertEngagementSurveyToDraftAction,
    undefined
  )

  if (!canManage || survey.state !== "scheduled") return null

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="surveyId" value={survey.id} />
      <EngagementFormFeedback state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {t("revertToDraft")}
      </Button>
    </form>
  )
}

function EngagementSurveyConfigurationFields({
  survey,
  filterOptions,
  cycleOptions,
  t,
  requireScheduleDates = false,
}: Omit<SurveyConfigFormProps, "canManage"> & {
  t: ReturnType<typeof useTranslations<"Erp.Hrm.employeeEngagement.config">>
  requireScheduleDates?: boolean
}) {
  const filter = survey.audienceFilter
  const reminders = survey.reminderSchedule

  return (
    <>
      <Field>
        <FieldLabel htmlFor="anonymityMode">
          {t("fieldAnonymityMode")}
        </FieldLabel>
        <Select name="anonymityMode" defaultValue={survey.anonymityMode}>
          <SelectTrigger id="anonymityMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HRM_ENGAGEMENT_ANONYMITY_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {t(`anonymityModeLabels.${mode}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="minSegmentResponses">
          {t("fieldMinSegmentResponses")}
        </FieldLabel>
        <Input
          id="minSegmentResponses"
          name="minSegmentResponses"
          type="number"
          min={1}
          max={100}
          defaultValue={
            survey.minSegmentResponses ??
            DEFAULT_ENGAGEMENT_MIN_SEGMENT_RESPONSES
          }
        />
        <p className="text-xs text-muted-foreground">{t("minSegmentHint")}</p>
      </Field>

      <Field>
        <input type="hidden" name="allowDraftResponses" value="off" />
        <div className="flex items-center gap-2">
          <Checkbox
            id="allowDraftResponses"
            name="allowDraftResponses"
            value="on"
            defaultChecked={survey.allowDraftResponses}
          />
          <FieldLabel htmlFor="allowDraftResponses">
            {t("fieldAllowDraftResponses")}
          </FieldLabel>
        </div>
        <p className="text-xs text-muted-foreground">{t("allowDraftHint")}</p>
      </Field>

      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">{t("cycleTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("cycleHint")}</p>
        <Field>
          <FieldLabel htmlFor="cycleId">{t("fieldCycle")}</FieldLabel>
          <Select name="cycleId" defaultValue={survey.cycleId ?? ""}>
            <SelectTrigger id="cycleId">
              <SelectValue placeholder={t("cycleSelectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("cycleNone")}</SelectItem>
              {cycleOptions.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.cycleKey} — {cycle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="cycleKey">{t("fieldCycleKey")}</FieldLabel>
            <Input
              id="cycleKey"
              name="cycleKey"
              maxLength={64}
              placeholder={t("cycleKeyPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cycleLabel">{t("fieldCycleLabel")}</FieldLabel>
            <Input
              id="cycleLabel"
              name="cycleLabel"
              maxLength={200}
              placeholder={t("cycleLabelPlaceholder")}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">{t("audienceTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("audienceHint")}</p>
        <Field>
          <FieldLabel htmlFor="minTenureMonths">
            {t("fieldMinTenure")}
          </FieldLabel>
          <Input
            id="minTenureMonths"
            name="minTenureMonths"
            type="number"
            min={0}
            defaultValue={filter.minTenureMonths ?? ""}
          />
        </Field>
        <AudienceCheckboxGroup
          name="legalEntityCodes"
          label={t("filterLegalEntity")}
          options={filterOptions.legalEntityCodes.map((code) => ({
            value: code,
            label: code,
          }))}
          selected={filterSet(filter, "legalEntityCodes")}
        />
        <AudienceCheckboxGroup
          name="departmentIds"
          label={t("filterDepartment")}
          options={filterOptions.departments.map((d) => ({
            value: d.id,
            label: `${d.code} — ${d.name}`,
          }))}
          selected={filterSet(filter, "departmentIds")}
        />
        <AudienceCheckboxGroup
          name="workLocationCodes"
          label={t("filterLocation")}
          options={filterOptions.workLocationCodes.map((code) => ({
            value: code,
            label: code,
          }))}
          selected={filterSet(filter, "workLocationCodes")}
        />
        <AudienceCheckboxGroup
          name="managerEmployeeIds"
          label={t("filterManager")}
          options={filterOptions.managers.map((m) => ({
            value: m.id,
            label: `${m.employeeNumber} — ${m.legalName}`,
          }))}
          selected={filterSet(filter, "managerEmployeeIds")}
        />
        <AudienceCheckboxGroup
          name="jobGradeIds"
          label={t("filterGrade")}
          options={filterOptions.jobGrades.map((g) => ({
            value: g.id,
            label: `${g.code} — ${g.name}`,
          }))}
          selected={filterSet(filter, "jobGradeIds")}
        />
        <AudienceCheckboxGroup
          name="employmentTypes"
          label={t("filterEmploymentType")}
          options={filterOptions.employmentTypes.map((type) => ({
            value: type,
            label: type,
          }))}
          selected={filterSet(filter, "employmentTypes")}
        />
        <AudienceCheckboxGroup
          name="workerCategories"
          label={t("filterWorkerCategory")}
          options={filterOptions.workerCategories.map((cat) => ({
            value: cat,
            label: cat,
          }))}
          selected={filterSet(filter, "workerCategories")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="openAt">{t("fieldOpenAt")}</FieldLabel>
          <Input
            id="openAt"
            name="openAt"
            type="datetime-local"
            required={requireScheduleDates}
            defaultValue={toDatetimeLocalValue(survey.openAt)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="closeAt">{t("fieldCloseAt")}</FieldLabel>
          <Input
            id="closeAt"
            name="closeAt"
            type="datetime-local"
            required={requireScheduleDates}
            defaultValue={toDatetimeLocalValue(survey.closeAt)}
          />
        </Field>
      </div>

      <Field>
        <div className="flex items-center gap-2">
          <Checkbox
            id="remindersEnabled"
            name="remindersEnabled"
            defaultChecked={reminders?.enabled ?? false}
          />
          <FieldLabel htmlFor="remindersEnabled">
            {t("fieldReminders")}
          </FieldLabel>
        </div>
        <Input
          name="reminderDaysBeforeClose"
          placeholder={t("reminderDaysPlaceholder")}
          defaultValue={reminders?.daysBeforeClose?.join(", ") ?? "7, 1"}
        />
      </Field>
    </>
  )
}

export function EngagementSurveyConfigureLinks({
  orgSlug,
  surveys,
}: {
  orgSlug: string
  surveys: ReadonlyArray<{ id: string; title: string; state: string }>
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.config")
  if (surveys.length === 0) return null

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {surveys.map((survey) => (
        <li key={survey.id}>
          <Link
            href={organizationHrmEmployeeEngagementSurveyPath(
              orgSlug,
              survey.id
            )}
            className="text-primary underline-offset-4 hover:underline"
          >
            {survey.title}
          </Link>
          <span className="text-muted-foreground">
            {" "}
            — {t(`surveyStateLabels.${survey.state as "draft" | "scheduled"}`)}
          </span>
        </li>
      ))}
    </ul>
  )
}
