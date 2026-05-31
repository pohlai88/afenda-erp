import {
  getHrCompensationCycleSummary,
  getHrCompensationParticipantContext,
  getHrCompensationSalaryBandContext,
  listHrCompensationRecommendationsWindow,
} from "@afenda/db";

import { buildHrCpmRecommendationsListSurface } from "../surface/hr.payroll.cpm-lists.surface";
import { buildHrCpmParticipantContextStatGroups } from "../surface/hr.payroll.cpm-participant-context-stat.surface";
import { buildHrCpmSalaryBandStatGroups } from "../surface/hr.payroll.cpm-salary-band-stat.surface";
import { hrCpmRecommendationsSurfaceKey } from "./hr.payroll.cpm-search-params.parse.shared";

const CPM_DEFAULT_PAGE_SIZE = 25;

export type HrCpmParticipantPageModel = {
  cycle: NonNullable<Awaited<ReturnType<typeof getHrCompensationCycleSummary>>>;
  participant: NonNullable<
    Awaited<ReturnType<typeof getHrCompensationParticipantContext>>
  >;
  salaryBand: Awaited<ReturnType<typeof getHrCompensationSalaryBandContext>>;
  participantContextStatGroups: ReturnType<
    typeof buildHrCpmParticipantContextStatGroups
  >;
  salaryBandStatGroups: ReturnType<typeof buildHrCpmSalaryBandStatGroups>;
  recommendationsList: ReturnType<typeof buildHrCpmRecommendationsListSurface>;
  canWrite: boolean;
  canApprove: boolean;
  surfaceKeys: {
    participantContext: "hr.payroll.cpm.participant.context.stats";
    salaryBand: "hr.payroll.cpm.participant.band.stats";
    recommendations: typeof hrCpmRecommendationsSurfaceKey;
  };
};

export async function buildHrCpmParticipantPageModel(input: {
  organizationId: string;
  cycleId: string;
  participantId: string;
  canWrite: boolean;
  canApprove: boolean;
  recommendationsSearch?: string;
}): Promise<HrCpmParticipantPageModel | null> {
  const [cycle, participant, recommendationsWindow] = await Promise.all([
    getHrCompensationCycleSummary({
      organizationId: input.organizationId,
      cycleId: input.cycleId,
    }),
    getHrCompensationParticipantContext({
      organizationId: input.organizationId,
      participantId: input.participantId,
    }),
    listHrCompensationRecommendationsWindow({
      organizationId: input.organizationId,
      cycleId: input.cycleId,
      participantId: input.participantId,
      limit: CPM_DEFAULT_PAGE_SIZE,
      search: input.recommendationsSearch,
    }),
  ]);

  if (!cycle || !participant || participant.cycleId !== input.cycleId) {
    return null;
  }

  const salaryBand = await getHrCompensationSalaryBandContext({
    organizationId: input.organizationId,
    grade: participant.currentGrade,
    legalEntityCode: participant.legalEntityCode,
    currentSalary: participant.currentSalary,
  });

  return {
    cycle,
    participant,
    salaryBand,
    participantContextStatGroups: buildHrCpmParticipantContextStatGroups({
      participant: {
        employeeLabel: participant.employeeLabel,
        currentSalary: participant.currentSalary,
        currentGrade: participant.currentGrade,
        currentLevel: participant.currentLevel,
        departmentName: participant.departmentName,
        managerLabel: participant.managerLabel,
        salaryEffectiveDate: participant.salaryEffectiveDate,
        currencyCode: participant.currencyCode,
      },
    }),
    salaryBandStatGroups: buildHrCpmSalaryBandStatGroups({
      band: salaryBand
        ? {
            grade: salaryBand.grade,
            minimum: salaryBand.minimum,
            midpoint: salaryBand.midpoint,
            maximum: salaryBand.maximum,
            currentSalary: participant.currentSalary,
            rangePosition: salaryBand.rangePosition,
            compaRatio: salaryBand.compaRatio,
            currencyCode: salaryBand.currencyCode,
          }
        : null,
    }),
    recommendationsList: buildHrCpmRecommendationsListSurface({
      window: recommendationsWindow,
      searchValue: input.recommendationsSearch,
      canWrite: input.canWrite,
      canApprove: input.canApprove,
    }),
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    surfaceKeys: {
      participantContext: "hr.payroll.cpm.participant.context.stats",
      salaryBand: "hr.payroll.cpm.participant.band.stats",
      recommendations: hrCpmRecommendationsSurfaceKey,
    },
  };
}
