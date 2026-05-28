import { getFormatter, getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { listActiveEmployeeChoicesForLeave } from "../../../time-attendance/server"
import { buildCareerPathingEmbeddedListSurfaceErrorConfiguration } from "../data/career-pathing-embedded-list-surface-error.server"
import { buildCareerDiscussionsListSurfaceConfiguration } from "../data/career-pathing-list-surface.server"
import { listCareerDiscussionsForOrg } from "../data/career-pathing.queries.server"
import { CareerDiscussionCreateForm } from "./career-pathing-forms.client"
import type { CareerPathingSectionProps } from "./career-pathing-section-props.shared"

export async function CareerPathingDiscussionsSection({
  organizationId,
  orgSlug,
  isHrmAdmin,
}: CareerPathingSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.careerPathing"),
    getFormatter(),
  ])

  let discussions: Awaited<ReturnType<typeof listCareerDiscussionsForOrg>>
  let employees: Awaited<ReturnType<typeof listActiveEmployeeChoicesForLeave>>

  try {
    ;[discussions, employees] = await Promise.all([
      listCareerDiscussionsForOrg(organizationId),
      listActiveEmployeeChoicesForLeave(organizationId),
    ])
  } catch (err) {
    logUnexpectedServerError("career-pathing-discussions: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("discussionsTitle")}</CardTitle>
          <CardDescription>{t("discussionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={buildCareerPathingEmbeddedListSurfaceErrorConfiguration(
              {
                columnsId: "hrm-career-discussions",
                emptyTitle: t("discussionsEmpty"),
                firstColumn: { id: "employee", header: t("fieldEmployee") },
              }
            )}
            surfaceKey="hrm:career-discussions:error"
            resolveConfiguredPermission={false}
            loadError={{
              variant: "error",
              title: t("discussionsTitle"),
              description: t("discussionsLoadFailed"),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const employeeChoices = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.employeeNumber} — ${employee.legalName}`,
  }))

  const listConfiguration = buildCareerDiscussionsListSurfaceConfiguration(
    discussions,
    orgSlug,
    {
      empty: t("discussionsEmpty"),
      colEmployee: t("fieldEmployee"),
      colDiscussionDate: t("fieldDiscussionDate"),
      colNextReview: t("fieldNextReviewDate"),
      colNotes: t("fieldNotes"),
      formatDate: (value) =>
        format.dateTime(new Date(value), { dateStyle: "medium" }),
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("discussionsTitle")}</CardTitle>
        <CardDescription>{t("discussionsDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title={t("discussionsTitle")}
        description={t("discussionsDescription")}
        listConfiguration={listConfiguration}
        surfaceKey="hrm:career-discussions"
        contentBeforeList={
          isHrmAdmin ? (
            <CardContent className="border-b border-border pb-4">
              <CareerDiscussionCreateForm
                organizationId={organizationId}
                orgSlug={orgSlug}
                employees={employeeChoices}
                labels={{
                  submit: t("createDiscussion"),
                  employee: t("fieldEmployee"),
                  date: t("fieldDiscussionDate"),
                  notes: t("fieldNotes"),
                }}
              />
            </CardContent>
          ) : undefined
        }
      />
    </Card>
  )
}
