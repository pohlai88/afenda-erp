import { getTranslations } from "next-intl/server"
import type { Route } from "next"

import { Button } from "@afenda/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Input } from "@afenda/ui/input"
import { Textarea } from "@afenda/ui/textarea"
import Link from "next/link"

import { submitCreateKpiGoalAction } from "../actions/kpi-goal.actions"
import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import { listKpiGoalAggregateForOrganization } from "../data/kpi-goal.queries.server"
import { listActiveEmployeeChoicesForLeave } from "@afenda/feature-hrm-time-attendance/server"
import type { ContractMutationFormState } from "@afenda/feature-hrm-core/shared"
import type { KpiGoalStatus } from "../schemas/kpi-goal.schema"

import { KpiGoalDetailSection } from "./kpi-goal-detail-section"
import { KpiGoalsListSection } from "./kpi-goals-list-section"

function asVoidKpiGoalAction(
  fn: (formData: FormData) => Promise<ContractMutationFormState>
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    await fn(formData)
  }
}

export type KpiGoalListGoalStatusFilter = "all" | KpiGoalStatus

type KpiGoalListProps = {
  orgSlug: string
  organizationId: string
  viewerUserId: string
  isHrmAdmin: boolean
  goalStatus: KpiGoalListGoalStatusFilter
  selectedGoalId?: string
}

function goalsHref(
  orgSlug: string,
  status: KpiGoalListGoalStatusFilter
): Route {
  const base = organizationHrmPath(orgSlug, "kpi")
  if (status === "all") {
    return `${base}?tab=goals` as Route
  }
  return `${base}?tab=goals&goalStatus=${status}` as Route
}

export async function KpiGoalList({
  orgSlug,
  organizationId,
  viewerUserId,
  isHrmAdmin,
  goalStatus,
  selectedGoalId,
}: KpiGoalListProps) {
  const [t, aggregate, employees] = await Promise.all([
    getTranslations("Erp.Hrm.kpi"),
    listKpiGoalAggregateForOrganization({
      organizationId,
      status: goalStatus === "all" ? undefined : goalStatus,
    }),
    listActiveEmployeeChoicesForLeave(organizationId),
  ])

  const { counts, goals } = aggregate

  if (selectedGoalId) {
    return (
      <div className="flex flex-col gap-6">
        <KpiGoalDetailSection
          orgSlug={orgSlug}
          organizationId={organizationId}
          viewerUserId={viewerUserId}
          isHrmAdmin={isHrmAdmin}
          goalId={selectedGoalId}
          goalStatus={goalStatus}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={goalStatus === "all" ? "secondary" : "outline"}
          size="sm"
          asChild
        >
          <Link href={goalsHref(orgSlug, "all")}>{t("goalsFilterAll")}</Link>
        </Button>
        <Button
          variant={goalStatus === "in_progress" ? "secondary" : "outline"}
          size="sm"
          asChild
        >
          <Link href={goalsHref(orgSlug, "in_progress")}>
            {t("goalsFilterInProgress")}
          </Link>
        </Button>
        <Button
          variant={goalStatus === "completed" ? "secondary" : "outline"}
          size="sm"
          asChild
        >
          <Link href={goalsHref(orgSlug, "completed")}>
            {t("goalsFilterCompleted")}
          </Link>
        </Button>
        <Button
          variant={goalStatus === "closed" ? "secondary" : "outline"}
          size="sm"
          asChild
        >
          <Link href={goalsHref(orgSlug, "closed")}>
            {t("goalsFilterClosed")}
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("goalsCounts", {
          inProgress: counts.in_progress,
          completed: counts.completed,
          closed: counts.closed,
        })}
      </p>

      {isHrmAdmin ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">{t("goalCreateTitle")}</CardTitle>
            <CardDescription>{t("goalsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={asVoidKpiGoalAction(submitCreateKpiGoalAction)}
              className="grid max-w-xl gap-3"
            >
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <div>
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="kpi-goal-emp"
                >
                  {t("goalFieldEmployee")}
                </label>
                <select
                  id="kpi-goal-emp"
                  name="ownerEmployeeId"
                  required
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t("selectEmployee")}</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employeeNumber} — {e.legalName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="kpi-goal-title"
                >
                  {t("goalFieldTitle")}
                </label>
                <Input
                  id="kpi-goal-title"
                  name="title"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="kpi-goal-desc"
                >
                  {t("goalFieldDescription")}
                </label>
                <Textarea
                  id="kpi-goal-desc"
                  name="description"
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="kpi-goal-due"
                >
                  {t("goalFieldDue")}
                </label>
                <Input
                  id="kpi-goal-due"
                  name="dueDate"
                  type="date"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="kpi-goal-align"
                >
                  {t("goalFieldAligns")}
                </label>
                <Input
                  id="kpi-goal-align"
                  name="alignsWithGoalId"
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="secondary" className="max-w-xs">
                {t("goalCreateSubmit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card size="sm">
        <CardContent className="pt-6">
          <KpiGoalsListSection
            orgSlug={orgSlug}
            goals={goals}
            goalStatus={goalStatus}
          />
        </CardContent>
      </Card>
    </div>
  )
}
