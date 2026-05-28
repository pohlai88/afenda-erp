import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRecruitmentInterviewsListSurfaceConfiguration } from "../data/recruitment-interviews-list-surface.server"
import type { InterviewQueueRow } from "../data/recruitment.queries.server"
import { HRM_INTERVIEW_OUTCOMES } from "../schemas/recruitment.schema"

import { RecruitmentInterviewsTrailingCell } from "./recruitment-interviews-trailing-cell.client"

type RecruitmentInterviewsListSectionProps = {
  orgSlug: string
  interviews: readonly InterviewQueueRow[]
}

function formatScheduled(value: Date): string {
  return value.toISOString().slice(0, 16).replace("T", " ")
}

export async function RecruitmentInterviewsListSection({
  orgSlug,
  interviews,
}: RecruitmentInterviewsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.recruitment")

  const listConfiguration = buildRecruitmentInterviewsListSurfaceConfiguration(
    interviews,
    {
      empty: t("interviewsEmpty"),
      colCandidate: t("fieldCandidateName"),
      colRole: t("fieldRequisition"),
      colScheduled: t("fieldInterviewWhen"),
      colOutcome: t("fieldOutcome"),
      formatScheduled,
      outcomePending: "—",
    }
  )

  return (
    <GovernedPatternCListSection
      title={t("interviewsTitle")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:recruitment:interviews"
      trailingColumn={{
        header: t("submitFeedback"),
        Cell: RecruitmentInterviewsTrailingCell,
        context: {
          orgSlug,
          outcomes: HRM_INTERVIEW_OUTCOMES,
          fieldOutcome: t("fieldOutcome"),
          fieldFeedback: t("fieldFeedback"),
          submitLabel: t("submitFeedback"),
          interviews: interviews.map((interview) => ({ id: interview.id })),
        },
      }}
    />
  )
}
