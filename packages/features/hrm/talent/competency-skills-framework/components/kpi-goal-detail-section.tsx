import { getFormatter, getTranslations } from "next-intl/server"
import type { Route } from "next"

import { Badge } from "@afenda/ui/badge"
import { Button } from "@afenda/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Input } from "@afenda/ui/input"
import { Progress } from "@afenda/ui/progress"
import Link from "next/link"

import {
  submitAddKpiGoalMilestoneAction,
  submitCloseKpiGoalAction,
  submitDeleteKpiGoalAction,
  submitDeleteKpiGoalCommentAction,
  submitPostKpiGoalCommentAction,
} from "../actions/kpi-goal.actions"
import {
  getKpiGoalById,
  listKpiGoalCommentsForGoals,
  listKpiGoalMilestonesForGoals,
} from "../data/kpi-goal.queries.server"
import { organizationHrmPath } from "../../../_core/shared"
import type { ContractMutationFormState } from "../../../_core/shared"
import type { KpiGoalListGoalStatusFilter } from "./kpi-goal-list"
import { KpiGoalMilestonesListSection } from "./kpi-goal-milestones-list-section"

function asVoidKpiGoalAction(
  fn: (formData: FormData) => Promise<ContractMutationFormState>
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    await fn(formData)
  }
}

type KpiGoalDetailSectionProps = {
  orgSlug: string
  organizationId: string
  viewerUserId: string
  isHrmAdmin: boolean
  goalId: string
  goalStatus: KpiGoalListGoalStatusFilter
}

export async function KpiGoalDetailSection({
  orgSlug,
  organizationId,
  viewerUserId,
  isHrmAdmin,
  goalId,
  goalStatus,
}: KpiGoalDetailSectionProps) {
  const [t, format, goal] = await Promise.all([
    getTranslations("Erp.Hrm.kpi"),
    getFormatter(),
    getKpiGoalById({ organizationId, goalId }),
  ])

  if (!goal) {
    return <p className="text-sm text-muted-foreground">{t("goalsEmpty")}</p>
  }

  const [milestones, comments] = await Promise.all([
    listKpiGoalMilestonesForGoals({ organizationId, goalIds: [goalId] }),
    listKpiGoalCommentsForGoals({ organizationId, goalIds: [goalId] }),
  ])

  const goalsListHref =
    goalStatus === "all"
      ? (`${organizationHrmPath(orgSlug, "kpi")}?tab=goals` as Route)
      : (`${organizationHrmPath(orgSlug, "kpi")}?tab=goals&goalStatus=${goalStatus}` as Route)

  return (
    <Card size="sm" data-testid={`kpi-goal-detail:${goalId}`}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
              <Link href={goalsListHref}>{t("goalBackToList")}</Link>
            </Button>
            <CardTitle className="text-base">{goal.title}</CardTitle>
            {goal.description ? (
              <CardDescription className="mt-1">
                {goal.description}
              </CardDescription>
            ) : null}
          </div>
          <Badge variant="outline">{goal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span>
            {t("goalOwner")}:{" "}
            <span className="text-foreground">{goal.ownerLegalName}</span>
          </span>
          <span>
            {t("goalDue")}:{" "}
            <span className="text-foreground">
              {format.dateTime(goal.dueDate, { dateStyle: "medium" })}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("goalPercent")}
          </p>
          <Progress value={goal.percentComplete} />
          <p className="text-xs text-muted-foreground">
            {goal.percentComplete}%
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t("goalMilestonesTitle")}</p>
          <KpiGoalMilestonesListSection
            orgSlug={orgSlug}
            milestones={milestones.map((m) => ({
              id: m.id,
              title: m.title,
            }))}
            isHrmAdmin={isHrmAdmin}
          />
          {isHrmAdmin ? (
            <form
              action={asVoidKpiGoalAction(submitAddKpiGoalMilestoneAction)}
              className="mt-3 flex flex-wrap gap-2"
            >
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <input type="hidden" name="goalId" value={goal.id} />
              <Input
                name="title"
                placeholder={t("goalMilestoneTitle")}
                className="max-w-xs"
                required
              />
              <Button type="submit" size="sm" variant="secondary">
                {t("goalMilestoneAdd")}
              </Button>
            </form>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t("goalCommentsTitle")}</p>
          <ul className="mb-3 flex flex-col gap-2 text-sm">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-border/60 bg-muted/30 px-3 py-2"
              >
                <p>{c.commentText}</p>
                {c.authorUserId === viewerUserId ? (
                  <form
                    action={asVoidKpiGoalAction(
                      submitDeleteKpiGoalCommentAction
                    )}
                    className="mt-2"
                  >
                    <input type="hidden" name="orgSlug" value={orgSlug} />
                    <input type="hidden" name="commentId" value={c.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {t("goalCommentDelete")}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          <form
            action={asVoidKpiGoalAction(submitPostKpiGoalCommentAction)}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="goalId" value={goal.id} />
            <Input
              name="text"
              placeholder={t("goalCommentPlaceholder")}
              className="flex-1"
              required
            />
            <Button type="submit" size="sm" variant="secondary">
              {t("goalCommentSubmit")}
            </Button>
          </form>
        </div>
      </CardContent>
      {isHrmAdmin ? (
        <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <form action={asVoidKpiGoalAction(submitCloseKpiGoalAction)}>
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="goalId" value={goal.id} />
            <Button type="submit" variant="outline" size="sm">
              {t("goalClose")}
            </Button>
          </form>
          <form action={asVoidKpiGoalAction(submitDeleteKpiGoalAction)}>
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="goalId" value={goal.id} />
            <Button type="submit" variant="destructive" size="sm">
              {t("goalDelete")}
            </Button>
          </form>
        </CardFooter>
      ) : null}
    </Card>
  )
}
