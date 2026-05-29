"use client"

import { useActionState, useId, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Badge } from "@afenda/ui/badge"
import { Button } from "@afenda/ui/button"
import { Field, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"

import { exportTimeClockReportAction } from "../actions/tci-report.actions"
import type { TimeClockReportFilterOptions } from "../tci-report-filter-options.shared"
import type { TimeClockReportExportFormState } from "@afenda/feature-hrm-core/shared"

const ALL_VALUE = "__all__"

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

export function TimeClockReportExportForm({
  orgSlug,
  filterOptions,
}: {
  orgSlug: string
  filterOptions: TimeClockReportFilterOptions
}) {
  const t = useTranslations("Erp.Hrm.timeClock.report")
  const [state, formAction, pending] = useActionState<
    TimeClockReportExportFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await exportTimeClockReportAction(prev, formData)
    if (next?.ok) {
      const blob = new Blob([next.csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = next.filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    }
    return next
  }, undefined)

  const startId = useId()
  const endId = useId()
  const employeeFieldId = useId()
  const deviceFieldId = useId()
  const departmentFieldId = useId()
  const locationFieldId = useId()
  const exceptionTypeFieldId = useId()
  const syncStatusFieldId = useId()

  const [employeeFilter, setEmployeeFilter] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [exceptionTypeFilter, setExceptionTypeFilter] = useState("")
  const [syncStatusFilter, setSyncStatusFilter] = useState("")
  const [selectedRowKinds, setSelectedRowKinds] = useState<ReadonlySet<string>>(
    () => new Set()
  )

  function toggleRowKind(value: string) {
    setSelectedRowKinds((previous) => {
      const next = new Set(previous)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="orgSlug" value={orgSlug} />

      {state?.ok ? (
        <Alert>
          <AlertTitle>{t("exportSuccessTitle")}</AlertTitle>
          <AlertDescription>
            {t("exportSuccessDescription", { count: state.rowCount })}
          </AlertDescription>
        </Alert>
      ) : null}
      {!state?.ok && state?.errors?.form ? (
        <Alert variant="destructive">
          <AlertTitle>{t("exportFailedTitle")}</AlertTitle>
          <AlertDescription>{state.errors.form}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={startId}>{t("fieldStartDate")}</FieldLabel>
          <Input
            id={startId}
            type="date"
            name="startDate"
            required
            defaultValue={isoDaysAgo(7)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={endId}>{t("fieldEndDate")}</FieldLabel>
          <Input
            id={endId}
            type="date"
            name="endDate"
            required
            defaultValue={todayIso()}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={employeeFieldId}>
            {t("fieldEmployee")}
          </FieldLabel>
          <Select
            value={employeeFilter || ALL_VALUE}
            onValueChange={(value) =>
              setEmployeeFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={employeeFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.employees.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="employeeId" value={employeeFilter} />
        </Field>
        <Field>
          <FieldLabel htmlFor={deviceFieldId}>{t("fieldDevice")}</FieldLabel>
          <Select
            value={deviceFilter || ALL_VALUE}
            onValueChange={(value) =>
              setDeviceFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={deviceFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.devices.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="deviceId" value={deviceFilter} />
        </Field>
        <Field>
          <FieldLabel htmlFor={departmentFieldId}>
            {t("fieldDepartment")}
          </FieldLabel>
          <Select
            value={departmentFilter || ALL_VALUE}
            onValueChange={(value) =>
              setDepartmentFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={departmentFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.departments.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="departmentId" value={departmentFilter} />
        </Field>
        <Field>
          <FieldLabel htmlFor={locationFieldId}>
            {t("fieldLocation")}
          </FieldLabel>
          <Select
            value={locationFilter || ALL_VALUE}
            onValueChange={(value) =>
              setLocationFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={locationFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.locations.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="locationRef" value={locationFilter} />
        </Field>
        <Field>
          <FieldLabel htmlFor={exceptionTypeFieldId}>
            {t("fieldExceptionType")}
          </FieldLabel>
          <Select
            value={exceptionTypeFilter || ALL_VALUE}
            onValueChange={(value) =>
              setExceptionTypeFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={exceptionTypeFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.detectionOutcomes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="detectionOutcome"
            value={exceptionTypeFilter}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={syncStatusFieldId}>
            {t("fieldSyncStatus")}
          </FieldLabel>
          <Select
            value={syncStatusFilter || ALL_VALUE}
            onValueChange={(value) =>
              setSyncStatusFilter(value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={syncStatusFieldId} className="w-full">
              <SelectValue placeholder={t("filterAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterAll")}</SelectItem>
              {filterOptions.syncStatuses.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="syncStatus" value={syncStatusFilter} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("fieldRowKinds")}</legend>
        <p className="text-sm text-muted-foreground">
          {t("fieldRowKindsHint")}
        </p>
        <div className="flex flex-wrap gap-2">
          {filterOptions.rowKinds.map((kind) => {
            const selected = selectedRowKinds.has(kind.value)
            return (
              <Badge
                key={kind.value}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer select-none"
                asChild
              >
                <button
                  type="button"
                  onClick={() => toggleRowKind(kind.value)}
                  aria-pressed={selected}
                >
                  {t(`rowKindLabels.${kind.value}`)}
                </button>
              </Badge>
            )
          })}
        </div>
        {[...selectedRowKinds].map((value) => (
          <input key={value} type="hidden" name="rowKinds" value={value} />
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="onlyExceptions" />
        <span>{t("fieldOnlyExceptions")}</span>
      </label>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("exporting")}
          </>
        ) : (
          t("exportSubmit")
        )}
      </Button>
    </form>
  )
}
