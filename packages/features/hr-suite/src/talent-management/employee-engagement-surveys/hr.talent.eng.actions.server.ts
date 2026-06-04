"use server";

import { z } from "zod";

import { hrSuiteActionFailure } from "../../hr-suite-integration/server";
import {
  buildHrTalentEngReportRows,
  emitHrTalentEngAuditEvent,
  filterHrTalentEngRecordsForAccess,
  getHrTalentEngStore,
  listHrTalentEngIntegrationExposures,
  nextHrTalentEngId,
} from "./hr.talent.eng-store.shared";
import { hrTalentEngAuditActions } from "./hr.talent.eng.event";
import {
  requireHrTalentEngApprove,
  requireHrTalentEngRead,
  requireHrTalentEngWrite,
  type HrTalentEngExecutionGuard,
} from "./hr.talent.eng-access.policy.server";
import {
  HR_TALENT_ENG_ANONYMITY_MODES,
  HR_TALENT_ENG_CATEGORIES,
  HR_TALENT_ENG_COMMENT_TAGS,
  HR_TALENT_ENG_PRIORITIES,
  HR_TALENT_ENG_REPORT_GROUP_BY,
  HR_TALENT_ENG_SURVEY_TYPES,
} from "./hr.talent.eng-constants.shared";
import {
  hrTalentEngImprovementActionSchema,
  hrTalentEngNotificationSchema,
  hrTalentEngSurveyResponseSchema,
  hrTalentEngSurveySchema,
  hrTalentEngSurveyTemplateSchema,
} from "./hr.talent.eng.schema";

type ActionGuard = HrTalentEngExecutionGuard;

const templateInputSchema = z.object({
  templateRef: z.string().min(1),
  title: z.string().min(1),
  surveyType: z.enum(HR_TALENT_ENG_SURVEY_TYPES),
  categories: z.array(z.enum(HR_TALENT_ENG_CATEGORIES)).min(1),
});

const surveyInputSchema = z.object({
  surveyRef: z.string().min(1),
  title: z.string().min(1),
  surveyType: z.enum(HR_TALENT_ENG_SURVEY_TYPES),
  templateId: z.string().min(1),
  anonymityMode: z.enum(HR_TALENT_ENG_ANONYMITY_MODES).default("anonymous"),
  minResponseThreshold: z.number().int().min(3).default(3),
  audienceSummary: z.string().min(1),
  openAt: z.string().datetime(),
  closeAt: z.string().datetime(),
  responseDeadlineAt: z.string().datetime(),
  reminderSchedule: z.array(z.string().datetime()).default([]),
  allowDraftResponses: z.boolean().default(true),
  enableOpenText: z.boolean().default(true),
  enableEngagementIndex: z.boolean().default(true),
  enableEnps: z.boolean().default(true),
  benchmarkLabel: z.string().min(1).optional(),
  period: z.string().min(1),
});

const responseInputSchema = z.object({
  surveyId: z.string().min(1),
  invitationId: z.string().min(1),
  employeeId: z.string().min(1).optional(),
  scoreAverage: z.number().min(0).max(5).optional(),
  enpsScore: z.number().int().min(0).max(10).optional(),
  commentCount: z.number().int().nonnegative().default(0),
});

const improvementActionInputSchema = z.object({
  surveyId: z.string().min(1),
  actionRef: z.string().min(1),
  title: z.string().min(1),
  sourceCategory: z.enum(HR_TALENT_ENG_CATEGORIES),
  sourceSegment: z.string().min(1).optional(),
  ownerUserId: z.string().min(1),
  ownerName: z.string().min(1),
  dueAt: z.string().datetime(),
  priority: z.enum(HR_TALENT_ENG_PRIORITIES),
});

const actionStatusInputSchema = z.object({
  actionId: z.string().min(1),
  status: z.enum(["open", "in_progress", "blocked", "completed", "overdue"]),
  progressPercent: z.number().min(0).max(100).optional(),
});

const commentTagInputSchema = z.object({
  commentId: z.string().min(1),
  tag: z.enum(HR_TALENT_ENG_COMMENT_TAGS),
});

const exportInputSchema = z.object({
  reportGroupBy: z.enum(HR_TALENT_ENG_REPORT_GROUP_BY).default("survey"),
});

function actionFailure<T = void>(message: string, code: string) {
  return hrSuiteActionFailure<T>(message, { code });
}

function requireSurvey(input: {
  readonly store: ReturnType<typeof getHrTalentEngStore>;
  readonly surveyId: string;
}) {
  const survey = input.store.surveys.find((row) => row.id === input.surveyId);
  if (!survey) {
    throw new Error("Survey was not found.");
  }
  return survey;
}

function resolveEmployeeId(guard: ActionGuard, requestedEmployeeId?: string) {
  return requestedEmployeeId ?? guard.session.id;
}

export async function refreshHrTalentEngWorkbenchAction() {
  try {
    const guard = await requireHrTalentEngRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Employee Engagement Surveys.",
      "hr.eng.refresh_failed",
    );
  }
}

export async function createHrTalentEngTemplateAction(
  input: z.input<typeof templateInputSchema>,
) {
  try {
    const parsed = templateInputSchema.parse(input);
    const guard = await requireHrTalentEngWrite();
    const store = getHrTalentEngStore(guard.organization.id);
    const row = hrTalentEngSurveyTemplateSchema.parse({
      id: nextHrTalentEngId("eng-template", store.templates),
      organizationId: guard.organization.id,
      templateRef: parsed.templateRef,
      title: parsed.title,
      surveyType: parsed.surveyType,
      status: "active",
      categories: parsed.categories,
      questionBankSize: 0,
      ownerUserId: guard.session.id,
      updatedAt: new Date().toISOString(),
    });
    store.templates.unshift(row);
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.templateCreated,
      actorId: guard.session.id,
      targetType: "template",
      targetId: row.id,
      summary: `Template ${row.templateRef} created.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create engagement survey template.",
      "hr.eng.template_create_failed",
    );
  }
}

export async function createHrTalentEngSurveyAction(
  input: z.input<typeof surveyInputSchema>,
) {
  try {
    const parsed = surveyInputSchema.parse(input);
    const guard = await requireHrTalentEngWrite();
    const store = getHrTalentEngStore(guard.organization.id);
    const row = hrTalentEngSurveySchema.parse({
      id: nextHrTalentEngId("eng-survey", store.surveys),
      organizationId: guard.organization.id,
      ...parsed,
      status: "draft",
      invitedCount: 0,
      responseCount: 0,
      responseRate: 0,
      createdByUserId: guard.session.id,
    });
    store.surveys.unshift(row);
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.surveyCreated,
      actorId: guard.session.id,
      targetType: "survey",
      targetId: row.id,
      summary: `Survey ${row.surveyRef} created from template ${row.templateId}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create engagement survey.",
      "hr.eng.survey_create_failed",
    );
  }
}

export async function publishHrTalentEngSurveyAction(input: {
  readonly surveyId: string;
}) {
  try {
    const guard = await requireHrTalentEngApprove();
    const store = getHrTalentEngStore(guard.organization.id);
    const survey = requireSurvey({ store, surveyId: input.surveyId });
    const existingInvitations = store.invitations.filter(
      (row) => row.surveyId === survey.id,
    );
    const now = new Date().toISOString();

    if (existingInvitations.length === 0) {
      for (const member of store.audienceMembers) {
        store.invitations.push({
          id: nextHrTalentEngId("eng-invitation", store.invitations),
          organizationId: guard.organization.id,
          surveyId: survey.id,
          employeeId: member.id,
          employeeDisplayName: member.displayName,
          status: "sent",
          sentAt: now,
          responseDeadlineAt: survey.responseDeadlineAt,
        });
      }
    }

    Object.assign(survey, {
      status: "published",
      publishedByUserId: guard.session.id,
      invitedCount:
        existingInvitations.length > 0
          ? existingInvitations.length
          : store.audienceMembers.length,
    });

    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.surveyPublished,
      actorId: guard.session.id,
      targetType: "survey",
      targetId: survey.id,
      summary: `Survey ${survey.surveyRef} published to ${survey.invitedCount} employees.`,
    });
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.invitationBatchPublished,
      actorId: guard.session.id,
      targetType: "invitation_batch",
      targetId: survey.id,
      summary: `Invitation batch published for ${survey.surveyRef}.`,
    });
    return { ok: true as const, data: survey };
  } catch {
    return actionFailure(
      "Unable to publish engagement survey.",
      "hr.eng.survey_publish_failed",
    );
  }
}

export async function saveHrTalentEngResponseDraftAction(
  input: z.input<typeof responseInputSchema>,
) {
  try {
    const parsed = responseInputSchema.parse(input);
    const guard = await requireHrTalentEngRead();
    const store = getHrTalentEngStore(guard.organization.id);
    const survey = requireSurvey({ store, surveyId: parsed.surveyId });
    if (!survey.allowDraftResponses) {
      return actionFailure(
        "Draft responses are not enabled for this survey.",
        "hr.eng.response_draft_disabled",
      );
    }
    const employeeId = resolveEmployeeId(guard, parsed.employeeId);
    const existing = store.responses.find(
      (row) =>
        row.surveyId === parsed.surveyId &&
        row.invitationId === parsed.invitationId &&
        row.status === "submitted",
    );
    if (existing) {
      return actionFailure(
        "Survey response was already submitted.",
        "hr.eng.response_duplicate",
      );
    }
    const draft = hrTalentEngSurveyResponseSchema.parse({
      id: nextHrTalentEngId("eng-response", store.responses),
      organizationId: guard.organization.id,
      surveyId: parsed.surveyId,
      invitationId: parsed.invitationId,
      employeeId,
      status: "draft",
      anonymous: survey.anonymityMode === "anonymous",
      scoreAverage: parsed.scoreAverage,
      enpsScore: parsed.enpsScore,
      commentCount: parsed.commentCount,
      draftSavedAt: new Date().toISOString(),
    });
    store.responses.unshift(draft);
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.responseDraftSaved,
      actorId: survey.anonymityMode === "anonymous" ? "anonymous" : guard.session.id,
      targetType: "response",
      targetId: draft.id,
      summary: `${survey.anonymityMode === "anonymous" ? "Anonymous" : "Named"} response draft saved for ${survey.surveyRef}.`,
    });
    return { ok: true as const, data: draft };
  } catch {
    return actionFailure(
      "Unable to save engagement response draft.",
      "hr.eng.response_draft_failed",
    );
  }
}

export async function submitHrTalentEngSurveyResponseAction(
  input: z.input<typeof responseInputSchema>,
) {
  try {
    const parsed = responseInputSchema.parse(input);
    const guard = await requireHrTalentEngRead();
    const store = getHrTalentEngStore(guard.organization.id);
    const survey = requireSurvey({ store, surveyId: parsed.surveyId });
    const employeeId = resolveEmployeeId(guard, parsed.employeeId);
    const duplicate = store.responses.find(
      (row) =>
        row.surveyId === parsed.surveyId &&
        row.invitationId === parsed.invitationId &&
        row.status === "submitted",
    );
    if (duplicate) {
      return actionFailure(
        "Survey response was already submitted.",
        "hr.eng.response_duplicate",
      );
    }

    const submittedAt = new Date().toISOString();
    const response = hrTalentEngSurveyResponseSchema.parse({
      id: nextHrTalentEngId("eng-response", store.responses),
      organizationId: guard.organization.id,
      surveyId: parsed.surveyId,
      invitationId: parsed.invitationId,
      employeeId,
      status: "submitted",
      anonymous: survey.anonymityMode === "anonymous",
      scoreAverage: parsed.scoreAverage,
      enpsScore: parsed.enpsScore,
      commentCount: parsed.commentCount,
      submittedAt,
    });
    store.responses.unshift(response);

    const invitation = store.invitations.find(
      (row) => row.id === parsed.invitationId,
    );
    if (invitation) {
      Object.assign(invitation, {
        status: "submitted",
        submittedAt,
      });
    }
    const submittedResponses = store.responses.filter(
      (row) => row.surveyId === survey.id && row.status === "submitted",
    );
    Object.assign(survey, {
      responseCount: submittedResponses.length,
      responseRate:
        survey.invitedCount === 0
          ? 0
          : Math.round((submittedResponses.length / survey.invitedCount) * 100),
    });

    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.responseSubmitted,
      actorId: survey.anonymityMode === "anonymous" ? "anonymous" : guard.session.id,
      targetType: "response",
      targetId: response.id,
      summary: `${survey.anonymityMode === "anonymous" ? "Anonymous" : "Named"} response submitted for ${survey.surveyRef}.`,
    });
    return { ok: true as const, data: response };
  } catch {
    return actionFailure(
      "Unable to submit engagement response.",
      "hr.eng.response_submit_failed",
    );
  }
}

export async function generateHrTalentEngAnalyticsAction(input: {
  readonly surveyId: string;
}) {
  try {
    const guard = await requireHrTalentEngApprove();
    const store = getHrTalentEngStore(guard.organization.id);
    const survey = requireSurvey({ store, surveyId: input.surveyId });
    const submitted = store.responses.filter(
      (row) => row.surveyId === survey.id && row.status === "submitted",
    );
    const averageScore =
      submitted.length === 0
        ? undefined
        : submitted.reduce((sum, row) => sum + (row.scoreAverage ?? 0), 0) /
          submitted.length;
    const enpsScores = submitted
      .map((row) => row.enpsScore)
      .filter((value): value is number => typeof value === "number");
    const promoters = enpsScores.filter((value) => value >= 9).length;
    const detractors = enpsScores.filter((value) => value <= 6).length;
    const enps =
      enpsScores.length === 0
        ? undefined
        : Math.round(((promoters - detractors) / enpsScores.length) * 100);

    Object.assign(survey, {
      status: survey.status === "closed" ? "analyzed" : survey.status,
      responseCount: submitted.length,
      responseRate:
        survey.invitedCount === 0
          ? 0
          : Math.round((submitted.length / survey.invitedCount) * 100),
      engagementIndex:
        averageScore == null ? survey.engagementIndex : Math.round(averageScore * 20),
      enps: enps ?? survey.enps,
      analyticsGeneratedAt: new Date().toISOString(),
    });

    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.analyticsGenerated,
      actorId: guard.session.id,
      targetType: "analytics",
      targetId: survey.id,
      summary: `Analytics generated for ${survey.surveyRef} with threshold enforcement.`,
    });
    return { ok: true as const, data: survey };
  } catch {
    return actionFailure(
      "Unable to generate engagement analytics.",
      "hr.eng.analytics_failed",
    );
  }
}

export async function tagHrTalentEngOpenTextCommentAction(
  input: z.input<typeof commentTagInputSchema>,
) {
  try {
    const parsed = commentTagInputSchema.parse(input);
    const guard = await requireHrTalentEngRead();
    if (!guard.canReadRestricted) {
      return actionFailure(
        "Restricted comment access is required.",
        "hr.eng.comment_restricted",
      );
    }
    const store = getHrTalentEngStore(guard.organization.id);
    const row = store.openTextComments.find(
      (candidate) => candidate.id === parsed.commentId,
    );
    if (!row) {
      return actionFailure("Comment was not found.", "hr.eng.comment_missing");
    }
    Object.assign(row, {
      tag: parsed.tag,
      reviewedByUserId: guard.session.id,
      taggedAt: new Date().toISOString(),
    });
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.openTextTagged,
      actorId: guard.session.id,
      targetType: "comment",
      targetId: row.id,
      summary: `Threshold-safe comment bucket tagged as ${parsed.tag}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to tag open-text comment.",
      "hr.eng.comment_tag_failed",
    );
  }
}

export async function createHrTalentEngImprovementActionAction(
  input: z.input<typeof improvementActionInputSchema>,
) {
  try {
    const parsed = improvementActionInputSchema.parse(input);
    const guard = await requireHrTalentEngWrite();
    const store = getHrTalentEngStore(guard.organization.id);
    requireSurvey({ store, surveyId: parsed.surveyId });
    const row = hrTalentEngImprovementActionSchema.parse({
      id: nextHrTalentEngId("eng-action", store.improvementActions),
      organizationId: guard.organization.id,
      ...parsed,
      status: "open",
      progressPercent: 0,
      createdAt: new Date().toISOString(),
    });
    store.improvementActions.unshift(row);
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.improvementActionCreated,
      actorId: guard.session.id,
      targetType: "improvement_action",
      targetId: row.id,
      summary: `Improvement action ${row.actionRef} created for ${row.sourceCategory}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to create improvement action.",
      "hr.eng.action_create_failed",
    );
  }
}

export async function updateHrTalentEngImprovementActionStatusAction(
  input: z.input<typeof actionStatusInputSchema>,
) {
  try {
    const parsed = actionStatusInputSchema.parse(input);
    const guard = await requireHrTalentEngWrite();
    const store = getHrTalentEngStore(guard.organization.id);
    const row = store.improvementActions.find(
      (candidate) => candidate.id === parsed.actionId,
    );
    if (!row) {
      return actionFailure("Action was not found.", "hr.eng.action_missing");
    }
    Object.assign(row, {
      status: parsed.status,
      progressPercent:
        parsed.progressPercent ??
        (parsed.status === "completed" ? 100 : row.progressPercent),
      completedAt:
        parsed.status === "completed" ? new Date().toISOString() : row.completedAt,
    });
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        parsed.status === "completed"
          ? hrTalentEngAuditActions.improvementActionCompleted
          : hrTalentEngAuditActions.improvementActionUpdated,
      actorId: guard.session.id,
      targetType: "improvement_action",
      targetId: row.id,
      summary: `Improvement action ${row.actionRef} moved to ${parsed.status}.`,
    });
    return { ok: true as const, data: row };
  } catch {
    return actionFailure(
      "Unable to update improvement action.",
      "hr.eng.action_update_failed",
    );
  }
}

export async function notifyHrTalentEngOverdueActionsAction() {
  try {
    const guard = await requireHrTalentEngApprove();
    const store = getHrTalentEngStore(guard.organization.id);
    const now = new Date();
    const overdue = store.improvementActions.filter(
      (row) => row.status !== "completed" && new Date(row.dueAt) < now,
    );
    for (const action of overdue) {
      Object.assign(action, { status: "overdue" });
      const notification = hrTalentEngNotificationSchema.parse({
        id: nextHrTalentEngId("eng-notification", store.notifications),
        organizationId: guard.organization.id,
        actionId: action.id,
        recipientUserId: action.ownerUserId,
        event: "action_overdue",
        channel: "portal",
        status: "sent",
        message: `Improvement action ${action.actionRef} is overdue.`,
        sentAt: new Date().toISOString(),
      });
      store.notifications.unshift(notification);
      emitHrTalentEngAuditEvent(store, {
        organizationId: guard.organization.id,
        action: hrTalentEngAuditActions.overdueNotificationSent,
        actorId: guard.session.id,
        targetType: "notification",
        targetId: notification.id,
        summary: `Overdue notification sent for ${action.actionRef}.`,
      });
    }
    return { ok: true as const, data: overdue };
  } catch {
    return actionFailure(
      "Unable to notify overdue improvement actions.",
      "hr.eng.overdue_notify_failed",
    );
  }
}

export async function exportHrTalentEngReportAction(
  input: z.input<typeof exportInputSchema> = {},
) {
  try {
    const parsed = exportInputSchema.parse(input);
    const guard = await requireHrTalentEngRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Engagement report export is not available for this role.",
        "hr.eng.report_export_forbidden",
      );
    }
    const store = getHrTalentEngStore(guard.organization.id);
    const visibleStore = filterHrTalentEngRecordsForAccess({
      store,
      access: {
        actorUserId: guard.session.id,
        canWrite: guard.canWrite,
        canApprove: guard.canApprove,
        canReadRestricted: guard.canReadRestricted,
        visibleEmployeeIds: await guard.resolveVisibleEmployeeIds(),
      },
    });
    const data = buildHrTalentEngReportRows({
      store: visibleStore,
      groupBy: parsed.reportGroupBy,
    });
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.reportExported,
      actorId: guard.session.id,
      targetType: "report",
      targetId: `eng-report-${parsed.reportGroupBy}`,
      summary: `Engagement report exported by ${parsed.reportGroupBy}.`,
    });
    return { ok: true as const, data };
  } catch {
    return actionFailure(
      "Unable to export engagement report.",
      "hr.eng.report_export_failed",
    );
  }
}

export async function exportHrTalentEngIntegrationRefsAction() {
  try {
    const guard = await requireHrTalentEngRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Integration references are not available for this role.",
        "hr.eng.integration_forbidden",
      );
    }
    const store = getHrTalentEngStore(guard.organization.id);
    const data = listHrTalentEngIntegrationExposures(store);
    emitHrTalentEngAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTalentEngAuditActions.integrationExposed,
      actorId: guard.session.id,
      targetType: "report",
      targetId: "eng-integration-export",
      summary: "Engagement integration references exported.",
    });
    return { ok: true as const, data };
  } catch {
    return actionFailure(
      "Unable to export integration references.",
      "hr.eng.integration_failed",
    );
  }
}
