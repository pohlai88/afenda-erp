import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { Badge } from "@afenda/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listEmployeeSkillsForEmployee } from "@afenda/feature-hrm-talent-management/server"
import {
  buildEmployeeDetailTrainingAssignmentListSurfaceConfiguration,
  buildTrainingRecordListSurfaceConfiguration,
} from "@afenda/feature-hrm-talent-management/server"
import {
  listTrainingAssignmentsForOrg,
  listTrainingRecordsForOrg,
} from "@afenda/feature-hrm-talent-management/server"

type EmployeeDetailTrainingSectionProps = {
  readonly organizationId: string
  readonly employeeId: string
}

export async function EmployeeDetailTrainingSection({
  organizationId,
  employeeId,
}: EmployeeDetailTrainingSectionProps) {
  const [t, format, assignments, records, skills] = await Promise.all([
    getTranslations("Erp.Hrm.training"),
    getFormatter(),
    listTrainingAssignmentsForOrg(organizationId, {
      employeeId,
      states: ["assigned", "overdue"],
    }),
    listTrainingRecordsForOrg(organizationId, { employeeId }),
    listEmployeeSkillsForEmployee(organizationId, employeeId),
  ])

  const assignmentsConfiguration =
    buildEmployeeDetailTrainingAssignmentListSurfaceConfiguration(assignments, {
      empty: t("employeeDetailUpcomingEmpty"),
      colCourse: t("colCourse"),
      colDue: t("colDue"),
      colState: t("colState"),
      formatDue: (value: Date) =>
        format.dateTime(value, { dateStyle: "medium" }),
    })

  const recordsConfiguration = buildTrainingRecordListSurfaceConfiguration(
    records,
    {
      empty: t("employeeDetailHistoryEmpty"),
      colCourse: t("colCourse"),
      colCompleted: t("employeeDetailHistory"),
      colVerification: "Verification",
      colExpires: t("expires"),
      formatDate: (value: Date) =>
        format.dateTime(value, { dateStyle: "medium" }),
    }
  )

  return (
    <Card id="training" size="sm">
      <CardHeader>
        <CardTitle className="text-base">{t("employeeDetailTitle")}</CardTitle>
        <CardDescription>{t("employeeDetailDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t("employeeDetailUpcoming")}</h3>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={assignmentsConfiguration}
            surfaceKey="hrm:employee-detail:training-assignments"
          />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t("employeeDetailHistory")}</h3>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={recordsConfiguration}
            surfaceKey="hrm:employee-detail:training-records"
          />
        </section>

        {skills.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{t("employeeDetailSkills")}</h3>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.skillId} variant="secondary">
                  {skill.skillLabel} ({skill.proficiency}/5)
                </Badge>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}
