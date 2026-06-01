import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrTrainingListRow } from "../contracts/hr.talent.training.contract";
import {
  hrTrainingCertificationDetailRoutePath,
  hrTrainingCourseDetailRoutePath,
} from "../contracts/hr.talent.training-route.contract";
import {
  buildHrTrainingListSurface,
} from "../surface/hr.talent.training-lists.surface";
import { buildHrTrainingOverviewStatGrid } from "../surface/hr.talent.training-overview-stat.surface";
import {
  hrTrainingAlertsSurfaceKey,
  hrTrainingAssessmentsSurfaceKey,
  hrTrainingAssignmentsSurfaceKey,
  hrTrainingAttendanceSurfaceKey,
  hrTrainingAuditTrailSurfaceKey,
  hrTrainingBoardingSurfaceKey,
  hrTrainingCertificationsSurfaceKey,
  hrTrainingCompetenciesSurfaceKey,
  hrTrainingComplianceSurfaceKey,
  hrTrainingCompletionsSurfaceKey,
  hrTrainingCostsSurfaceKey,
  hrTrainingCoursesSurfaceKey,
  hrTrainingDevelopmentPlansSurfaceKey,
  hrTrainingEnrollmentsSurfaceKey,
  hrTrainingFeedbackSurfaceKey,
  hrTrainingProvidersSurfaceKey,
  hrTrainingReadinessSurfaceKey,
  hrTrainingReportsSurfaceKey,
  hrTrainingRequirementsSurfaceKey,
  hrTrainingSkillGapsSurfaceKey,
  hrTrainingSkillsSurfaceKey,
  type HrTrainingListSurfaceKey,
} from "../surface/hr.talent.training-surface-metadata.shared";
import { hrTalentTrainingUiCopy } from "../surface/hr.talent.training-ui.copy.shared";
import type { HrTrainingPageModelInput } from "./hr.talent.training-search-params.parse.shared";
import {
  buildHrTrainingReportRows,
  filterHrTrainingRecordsForAccess,
  getHrTrainingStore,
  listHrTrainingBoardingCompletionRefs,
  listHrTrainingComplianceCompletionRefs,
  listHrTrainingReadinessRefs,
  type HrTrainingStore,
} from "./hr.talent.training-store.shared";

const TRAINING_DEFAULT_PAGE_SIZE = 25;

export type HrTrainingPageModelListSection = {
  readonly surfaceKey: HrTrainingListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrTrainingPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrTrainingPageModelInput["reportGroupBy"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrTrainingPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not scheduled";
}

function formatMoney(amount: number, currency = "MYR") {
  return `${currency} ${amount.toLocaleString("en-MY")}`;
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, TRAINING_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, TRAINING_DEFAULT_PAGE_SIZE);
}

function indexStore(store: HrTrainingStore) {
  const courses = new Map(store.courses.map((course) => [course.id, course]));
  const providers = new Map(
    store.providers.map((provider) => [provider.id, provider]),
  );
  return { courses, providers };
}

function toneForStatus(status: string): HrTrainingListRow["rowTone"] {
  if (["expired", "missing", "failed", "no_show", "overdue"].includes(status)) {
    return "critical";
  }
  if (["waitlisted", "pending_approval", "expiring", "open"].includes(status)) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  surfaceKey: HrTrainingListSurfaceKey;
  rows: readonly HrTrainingListRow[];
  searchValue?: string;
}): HrTrainingPageModelListSection {
  const copy = hrTalentTrainingUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrTrainingListSurface(input),
  };
}

export async function buildHrTrainingPageModel(
  input: HrTrainingPageModelInput,
): Promise<HrTrainingPageModel> {
  const store = getHrTrainingStore(input.organizationId);
  const visibleStore = filterHrTrainingRecordsForAccess({
    store,
    access: { visibleEmployeeIds: input.visibleEmployeeIds },
  });
  const { courses, providers } = indexStore(visibleStore);
  const reportRows = buildHrTrainingReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrTrainingOverviewStatGrid({
    snapshot: {
      activeCourseCount: visibleStore.courses.filter(
        (course) => course.status === "active",
      ).length,
      pendingApprovalCount: visibleStore.enrollments.filter(
        (enrollment) => enrollment.status === "pending_approval",
      ).length,
      waitlistedCount: visibleStore.enrollments.filter(
        (enrollment) => enrollment.status === "waitlisted",
      ).length,
      certificationRiskCount: visibleStore.certifications.filter(
        (certification) =>
          certification.status === "expired" ||
          certification.status === "missing" ||
          certification.status === "expiring",
      ).length,
      openSkillGapCount: visibleStore.skillGaps.filter(
        (gap) => gap.status !== "closed",
      ).length,
      spendAmount: visibleStore.costs.reduce((sum, row) => sum + row.amount, 0),
    },
  });

  const baseSections: HrTrainingPageModelListSection[] = [
    section({
      surfaceKey: hrTrainingCoursesSurfaceKey,
      rows: filterRows(visibleStore.courses, input.coursesSearch).map(
        (course) => ({
          id: course.id,
          rowHref: hrTrainingCourseDetailRoutePath(course.id),
          cells: {
            code: course.code,
            title: course.title,
            trainingType: formatEnumLabel(course.trainingType),
            deliveryMode: formatEnumLabel(course.deliveryMode),
            capacity: course.capacity,
            cost: formatMoney(course.costAmount, course.currency),
            status: formatEnumLabel(course.status),
          },
        }),
      ),
      searchValue: input.coursesSearch,
    }),
    section({
      surfaceKey: hrTrainingProvidersSurfaceKey,
      rows: filterRows(visibleStore.providers, input.providersSearch).map(
        (provider) => ({
          id: provider.id,
          cells: {
            name: provider.name,
            providerType: formatEnumLabel(provider.providerType),
            contactName: provider.contactName,
            accreditationRef: provider.accreditationRef ?? "Not recorded",
            status: formatEnumLabel(provider.status),
          },
        }),
      ),
      searchValue: input.providersSearch,
    }),
    section({
      surfaceKey: hrTrainingRequirementsSurfaceKey,
      rows: filterRows(visibleStore.requirements, input.requirementsSearch).map(
        (requirement) => {
          const course = courses.get(requirement.courseId);
          return {
            id: requirement.id,
            cells: {
              courseCode: course?.code ?? requirement.courseId,
              scope: `${formatEnumLabel(requirement.scopeKind)}: ${requirement.scopeValue}`,
              mandatory: requirement.mandatory,
              recurrence: requirement.recurrenceMonths
                ? `${requirement.recurrenceMonths} months`
                : "One time",
              dueWithinDays: `${requirement.dueWithinDays} days`,
            },
          };
        },
      ),
      searchValue: input.requirementsSearch,
    }),
    section({
      surfaceKey: hrTrainingAssignmentsSurfaceKey,
      rows: filterRows(visibleStore.assignments, input.assignmentsSearch).map(
        (assignment) => {
          const course = courses.get(assignment.courseId);
          return {
            id: assignment.id,
            rowTone: toneForStatus(assignment.status),
            cells: {
              employeeDisplayName: assignment.employeeDisplayName,
              courseCode: course?.code ?? assignment.courseId,
              departmentName: assignment.departmentName,
              assignmentSource: formatEnumLabel(assignment.assignmentSource),
              dueAt: formatDate(assignment.dueAt),
              status: formatEnumLabel(assignment.status),
            },
          };
        },
      ),
      searchValue: input.assignmentsSearch,
    }),
    section({
      surfaceKey: hrTrainingEnrollmentsSurfaceKey,
      rows: filterRows(visibleStore.enrollments, input.enrollmentsSearch).map(
        (enrollment) => {
          const course = courses.get(enrollment.courseId);
          return {
            id: enrollment.id,
            rowTone: toneForStatus(enrollment.status),
            cells: {
              employeeDisplayName: enrollment.employeeDisplayName,
              courseCode: course?.code ?? enrollment.courseId,
              status: formatEnumLabel(enrollment.status),
              approvalRequired: enrollment.approvalRequired,
              approvedByUserId: enrollment.approvedByUserId ?? "Pending",
              waitlistPosition: enrollment.waitlistPosition ?? "Not waitlisted",
            },
          };
        },
      ),
      searchValue: input.enrollmentsSearch,
    }),
    section({
      surfaceKey: hrTrainingAttendanceSurfaceKey,
      rows: filterRows(visibleStore.attendance, input.attendanceSearch).map(
        (attendance) => {
          const course = courses.get(attendance.courseId);
          return {
            id: attendance.id,
            rowTone: toneForStatus(attendance.status),
            cells: {
              employeeDisplayName: attendance.employeeDisplayName,
              courseCode: course?.code ?? attendance.courseId,
              sessionDate: formatDate(attendance.sessionDate),
              status: formatEnumLabel(attendance.status),
              recordedByUserId: attendance.recordedByUserId,
            },
          };
        },
      ),
      searchValue: input.attendanceSearch,
    }),
    section({
      surfaceKey: hrTrainingCompletionsSurfaceKey,
      rows: filterRows(visibleStore.completions, input.completionsSearch).map(
        (completion) => {
          const course = courses.get(completion.courseId);
          return {
            id: completion.id,
            rowTone: toneForStatus(completion.status),
            cells: {
              employeeDisplayName: completion.employeeDisplayName,
              courseCode: course?.code ?? completion.courseId,
              status: formatEnumLabel(completion.status),
              completedAt: formatDate(completion.completedAt),
              expiresAt: formatDate(completion.expiresAt),
              lmsCompletionRef: completion.lmsCompletionRef ?? "Training record",
            },
          };
        },
      ),
      searchValue: input.completionsSearch,
    }),
    section({
      surfaceKey: hrTrainingAssessmentsSurfaceKey,
      rows: filterRows(visibleStore.assessments, input.assessmentsSearch).map(
        (assessment) => {
          const course = courses.get(assessment.courseId);
          return {
            id: assessment.id,
            rowTone: toneForStatus(assessment.result),
            cells: {
              employeeDisplayName: assessment.employeeDisplayName,
              courseCode: course?.code ?? assessment.courseId,
              assessmentDate: formatDate(assessment.assessmentDate),
              score: input.canReadRestricted
                ? (assessment.score ?? "Pending")
                : "Restricted",
              passingScore: input.canReadRestricted
                ? assessment.passingScore
                : "Restricted",
              result: formatEnumLabel(assessment.result),
            },
          };
        },
      ),
      searchValue: input.assessmentsSearch,
    }),
    section({
      surfaceKey: hrTrainingSkillsSurfaceKey,
      rows: filterRows(visibleStore.skillProfiles, input.skillsSearch).map(
        (skill) => ({
          id: skill.id,
          cells: {
            employeeDisplayName: skill.employeeDisplayName,
            skillName: skill.skillName,
            skillCategory: formatEnumLabel(skill.skillCategory),
            proficiencyLevel: formatEnumLabel(skill.proficiencyLevel),
            evidenceRef: input.canReadRestricted
              ? (skill.evidenceRef ?? "Not linked")
              : "Restricted",
            lastAssessedAt: formatDate(skill.lastAssessedAt),
          },
        }),
      ),
      searchValue: input.skillsSearch,
    }),
    section({
      surfaceKey: hrTrainingCompetenciesSurfaceKey,
      rows: filterRows(visibleStore.competencies, input.competenciesSearch).map(
        (competency) => ({
          id: competency.id,
          cells: {
            name: competency.name,
            category: formatEnumLabel(competency.category),
            requiredLevel: formatEnumLabel(competency.requiredLevel),
            roleTitle: competency.roleTitle,
            departmentName: competency.departmentName,
            grade: competency.grade,
          },
        }),
      ),
      searchValue: input.competenciesSearch,
    }),
    section({
      surfaceKey: hrTrainingSkillGapsSurfaceKey,
      rows: filterRows(visibleStore.skillGaps, input.skillGapsSearch).map(
        (gap) => ({
          id: gap.id,
          rowTone: toneForStatus(gap.severity),
          cells: {
            employeeDisplayName: gap.employeeDisplayName,
            competencyName: gap.competencyName,
            requiredLevel: formatEnumLabel(gap.requiredLevel),
            currentLevel: formatEnumLabel(gap.currentLevel),
            severity: formatEnumLabel(gap.severity),
            status: formatEnumLabel(gap.status),
          },
        }),
      ),
      searchValue: input.skillGapsSearch,
    }),
    section({
      surfaceKey: hrTrainingDevelopmentPlansSurfaceKey,
      rows: filterRows(
        visibleStore.developmentPlans,
        input.developmentPlansSearch,
      ).map((plan) => ({
        id: plan.id,
        rowTone: toneForStatus(plan.status),
        cells: {
          employeeDisplayName: plan.employeeDisplayName,
          title: plan.title,
          source: formatEnumLabel(plan.source),
          targetDate: formatDate(plan.targetDate),
          progressPercent: `${plan.progressPercent}%`,
          status: formatEnumLabel(plan.status),
        },
      })),
      searchValue: input.developmentPlansSearch,
    }),
    section({
      surfaceKey: hrTrainingCertificationsSurfaceKey,
      rows: filterRows(
        visibleStore.certifications,
        input.certificationsSearch,
      ).map((certification) => ({
        id: certification.id,
        rowHref: hrTrainingCertificationDetailRoutePath(certification.id),
        rowTone: toneForStatus(certification.status),
        cells: {
          employeeDisplayName: certification.employeeDisplayName,
          certificationName: certification.certificationName,
          issuingBody: certification.issuingBody,
          expiryDate: formatDate(certification.expiryDate),
          documentEvidenceRef: input.canReadRestricted
            ? (certification.documentEvidenceRef ?? "Not linked")
            : "Restricted",
          status: formatEnumLabel(certification.status),
        },
      })),
      searchValue: input.certificationsSearch,
    }),
    section({
      surfaceKey: hrTrainingAlertsSurfaceKey,
      rows: filterRows(visibleStore.alerts, input.alertsSearch).map((alert) => ({
        id: alert.id,
        rowTone: toneForStatus(alert.severity),
        cells: {
          employeeDisplayName: alert.employeeDisplayName,
          audience: formatEnumLabel(alert.audience),
          alertAt: formatDate(alert.alertAt),
          severity: formatEnumLabel(alert.severity),
          status: formatEnumLabel(alert.status),
          message: alert.message,
        },
      })),
      searchValue: input.alertsSearch,
    }),
    section({
      surfaceKey: hrTrainingFeedbackSurfaceKey,
      rows: filterRows(visibleStore.feedback, input.feedbackSearch).map(
        (feedback) => {
          const course = courses.get(feedback.courseId);
          return {
            id: feedback.id,
            cells: {
              employeeDisplayName: feedback.employeeDisplayName,
              courseCode: course?.code ?? feedback.courseId,
              submittedAt: formatDate(feedback.submittedAt),
              rating: `${feedback.rating}/5`,
              comments: feedback.comments,
            },
          };
        },
      ),
      searchValue: input.feedbackSearch,
    }),
    section({
      surfaceKey: hrTrainingCostsSurfaceKey,
      rows: filterRows(visibleStore.costs, input.costsSearch).map((cost) => {
        const course = courses.get(cost.courseId);
        const provider = providers.get(cost.providerId);
        return {
          id: cost.id,
          cells: {
            employeeDisplayName: cost.employeeDisplayName,
            courseCode: course?.code ?? cost.courseId,
            departmentName: cost.departmentName,
            providerName: provider?.name ?? cost.providerId,
            period: cost.period,
            amount: input.canReadRestricted
              ? formatMoney(cost.amount, cost.currency)
              : "Restricted",
          },
        };
      }),
      searchValue: input.costsSearch,
    }),
    section({
      surfaceKey: hrTrainingReportsSurfaceKey,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone: row.overdueCount > 0 ? "attention" : undefined,
        cells: {
          groupLabel: row.groupLabel,
          assignedCount: row.assignedCount,
          completedCount: row.completedCount,
          overdueCount: row.overdueCount,
          complianceRate: `${row.complianceRate}%`,
          costAmount: input.canReadRestricted
            ? formatMoney(row.costAmount)
            : "Restricted",
        },
      })),
      searchValue: input.reportsSearch,
    }),
  ];

  if (input.canExposeIntegrations) {
    baseSections.push(
      section({
        surfaceKey: hrTrainingComplianceSurfaceKey,
        rows: filterRows(
          listHrTrainingComplianceCompletionRefs(visibleStore),
          input.complianceSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.completionStatus),
          cells: {
            employeeDisplayName: row.employeeDisplayName,
            courseCode: row.courseCode,
            requirementRef: row.requirementRef,
            completionStatus: formatEnumLabel(row.completionStatus),
            expiresAt: formatDate(row.expiresAt),
            sourceSystem: formatEnumLabel(row.sourceSystem),
          },
        })),
        searchValue: input.complianceSearch,
      }),
      section({
        surfaceKey: hrTrainingReadinessSurfaceKey,
        rows: filterRows(
          listHrTrainingReadinessRefs(visibleStore),
          input.readinessSearch,
        ).map((row) => ({
          id: row.id,
          rowTone:
            row.readinessSignal === "development_required"
              ? "attention"
              : undefined,
          cells: {
            employeeDisplayName: row.employeeDisplayName,
            consumer: formatEnumLabel(row.consumer),
            readinessSignal: formatEnumLabel(row.readinessSignal),
            certificationStatus: formatEnumLabel(row.certificationStatus),
            openSkillGapCount: row.openSkillGapCount,
            authorizedAt: formatDate(row.authorizedAt),
          },
        })),
        searchValue: input.readinessSearch,
      }),
      section({
        surfaceKey: hrTrainingBoardingSurfaceKey,
        rows: filterRows(
          listHrTrainingBoardingCompletionRefs(visibleStore),
          input.boardingSearch,
        ).map((row) => ({
          id: row.id,
          cells: {
            employeeDisplayName: row.employeeDisplayName,
            trainingCourseCode: row.trainingCourseCode,
            onboardingTaskRef: row.onboardingTaskRef,
            completionStatus: formatEnumLabel(row.completionStatus),
            completedAt: formatDate(row.completedAt),
          },
        })),
        searchValue: input.boardingSearch,
      }),
    );
  }

  if (input.canReadAudit) {
    baseSections.push(
      section({
        surfaceKey: hrTrainingAuditTrailSurfaceKey,
        rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetType: formatEnumLabel(event.targetType),
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
        searchValue: input.auditTrailSearch,
      }),
    );
  }

  return {
    title: hrTalentTrainingUiCopy.page.title,
    description: hrTalentTrainingUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    overview,
    sections: baseSections,
    workbenchList: baseSections[0]?.listConfiguration ?? buildHrTrainingListSurface({
      surfaceKey: hrTrainingCoursesSurfaceKey,
      rows: [],
    }),
  };
}

export const buildHrTalentTrainingPageModel = buildHrTrainingPageModel;
export type HrTalentTrainingPageModel = HrTrainingPageModel;
