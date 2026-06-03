import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { appendHrLmsAuditEventInTx } from "./hr-lms-audit";
import {
  hrLmsAssignments,
  hrLmsCertifications,
  hrLmsCourseContentRefs,
  hrLmsCourses,
  hrLmsEnrollments,
  hrLmsLearningPathCourses,
  hrLmsLearningPaths,
  hrLmsProgress,
  hrLmsReminders,
  hrLmsAuditEvents,
} from "./hr-lms";

export {
  HrLmsCommandError,
  assertHrLmsAttemptLimit,
  assertHrLmsPassingScore,
  HR_LMS_PROGRESS_STATUSES,
  type HrLmsProgressStatus,
} from "./hr-lms.shared";

export {
  appendHrLmsAuditEventInTx,
  HR_LMS_AUDIT_ACTIONS,
  type AppendHrLmsAuditEventInput,
} from "./hr-lms-audit";

const DEFAULT_PAGE_SIZE = 25;

export type HrLmsCourseSummary = {
  id: string;
  code: string;
  title: string;
  category: string;
  provider: string;
  durationMinutes: number;
  level: string;
  language: string;
  deliveryMode: string;
  courseType: string;
  courseStatus: string;
  selfEnrollmentEnabled: boolean;
  approvalRequired: boolean;
};

function mapCourseSummary(
  row: typeof hrLmsCourses.$inferSelect,
): HrLmsCourseSummary {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    category: row.category,
    provider: row.provider,
    durationMinutes: row.durationMinutes,
    level: row.level,
    language: row.language,
    deliveryMode: row.deliveryMode,
    courseType: row.courseType,
    courseStatus: row.courseStatus,
    selfEnrollmentEnabled: row.selfEnrollmentEnabled,
    approvalRequired: row.approvalRequired,
  };
}

export async function listHrLmsCoursesWindow(input: {
  organizationId: string;
  search?: string;
  courseType?: (typeof hrLmsCourses.$inferSelect)["courseType"];
  courseStatus?: (typeof hrLmsCourses.$inferSelect)["courseStatus"];
  limit?: number;
  offset?: number;
}) {
  const limit = clampPageSize(input.limit ?? DEFAULT_PAGE_SIZE);
  const offset = input.offset ?? 0;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const filters = [eq(hrLmsCourses.organizationId, input.organizationId)];

    if (input.courseType) {
      filters.push(eq(hrLmsCourses.courseType, input.courseType));
    }
    if (input.courseStatus) {
      filters.push(eq(hrLmsCourses.courseStatus, input.courseStatus));
    }
    if (input.search?.trim()) {
      const pattern = `%${input.search.trim()}%`;
      filters.push(
        or(
          ilike(hrLmsCourses.code, pattern),
          ilike(hrLmsCourses.title, pattern),
          ilike(hrLmsCourses.category, pattern),
          ilike(hrLmsCourses.provider, pattern),
        )!,
      );
    }

    const whereClause = and(...filters);

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(hrLmsCourses)
        .where(whereClause)
        .orderBy(asc(hrLmsCourses.title))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(hrLmsCourses).where(whereClause),
    ]);

    return buildPaginatedWindow({
      rows: rows.map(mapCourseSummary),
      totalCount: Number(totalRows[0]?.count ?? 0),
      pageSize: limit,
      offset,
    });
  });
}

export type CreateHrLmsCourseInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  title: string;
  category: string;
  description?: string | null;
  provider: string;
  durationMinutes?: number;
  level?: string;
  language?: string;
  deliveryMode?: (typeof hrLmsCourses.$inferInsert)["deliveryMode"];
  courseType?: (typeof hrLmsCourses.$inferInsert)["courseType"];
  validityDays?: number | null;
  passingScore?: string | null;
  attemptLimit?: number | null;
  selfEnrollmentEnabled?: boolean;
  approvalRequired?: boolean;
  scormEnabled?: boolean;
  xapiEnabled?: boolean;
  externalLmsEnabled?: boolean;
  trainingCourseId?: string | null;
  courseStatus?: (typeof hrLmsCourses.$inferInsert)["courseStatus"];
  contentRefs?: Array<{
    refKind: (typeof hrLmsCourseContentRefs.$inferInsert)["refKind"];
    label: string;
    uri: string;
    providerName?: string | null;
    isPrimary?: boolean;
  }>;
};

export async function createHrLmsCourseInTx(
  db: AfendaTransaction,
  input: CreateHrLmsCourseInput,
) {
  const courseId = createEntityId("hr_lms_course");

  const [course] = await db
    .insert(hrLmsCourses)
    .values({
      id: courseId,
      organizationId: input.organizationId,
      code: input.code,
      title: input.title,
      category: input.category,
      description: input.description ?? null,
      provider: input.provider,
      durationMinutes: input.durationMinutes ?? 0,
      level: input.level ?? "beginner",
      language: input.language ?? "en",
      deliveryMode: input.deliveryMode ?? "self_paced",
      courseType: input.courseType ?? "online_course",
      validityDays: input.validityDays ?? null,
      passingScore: input.passingScore ?? null,
      attemptLimit: input.attemptLimit ?? null,
      selfEnrollmentEnabled: input.selfEnrollmentEnabled ?? false,
      approvalRequired: input.approvalRequired ?? false,
      scormEnabled: input.scormEnabled ?? false,
      xapiEnabled: input.xapiEnabled ?? false,
      externalLmsEnabled: input.externalLmsEnabled ?? false,
      trainingCourseId: input.trainingCourseId ?? null,
      courseStatus: input.courseStatus ?? "draft",
    })
    .returning();

  if (input.contentRefs?.length) {
    await db.insert(hrLmsCourseContentRefs).values(
      input.contentRefs.map((ref, index) => ({
        id: createEntityId("hr_lms_content_ref"),
        organizationId: input.organizationId,
        courseId,
        refKind: ref.refKind,
        label: ref.label,
        uri: ref.uri,
        providerName: ref.providerName ?? null,
        isPrimary: ref.isPrimary ?? index === 0,
      })),
    );
  }

  await appendHrLmsAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "course_setup",
    entityType: "hr_lms_course",
    entityId: courseId,
    summary: `Created LMS course ${input.code}`,
  });

  return mapCourseSummary(course!);
}

export async function createHrLmsCourse(input: CreateHrLmsCourseInput) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrLmsCourseInTx(db, input),
  );
}

export type HrLmsComplianceCompletionRow = {
  employeeId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  progressStatus: string;
  completedAt: string | null;
  isMandatory: boolean;
};

export async function getHrLmsComplianceCompletionSnapshot(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        employeeId: hrLmsAssignments.employeeId,
        courseId: hrLmsCourses.id,
        courseCode: hrLmsCourses.code,
        courseTitle: hrLmsCourses.title,
        progressStatus: hrLmsProgress.progressStatus,
        completedAt: hrLmsProgress.completedAt,
        isMandatory: hrLmsAssignments.isComplianceMandatory,
      })
      .from(hrLmsAssignments)
      .innerJoin(hrLmsCourses, eq(hrLmsAssignments.courseId, hrLmsCourses.id))
      .leftJoin(
        hrLmsEnrollments,
        and(
          eq(hrLmsEnrollments.organizationId, input.organizationId),
          eq(hrLmsEnrollments.employeeId, hrLmsAssignments.employeeId),
          eq(hrLmsEnrollments.courseId, hrLmsAssignments.courseId),
        ),
      )
      .leftJoin(
        hrLmsProgress,
        and(
          eq(hrLmsProgress.organizationId, input.organizationId),
          eq(hrLmsProgress.enrollmentId, hrLmsEnrollments.id),
        ),
      )
      .where(
        and(
          eq(hrLmsAssignments.organizationId, input.organizationId),
          eq(hrLmsAssignments.isComplianceMandatory, true),
        ),
      )
      .orderBy(desc(hrLmsAssignments.createdAt));

    return rows
      .filter((row) =>
        input.employeeIds ? input.employeeIds.includes(row.employeeId) : true,
      )
      .map(
        (row): HrLmsComplianceCompletionRow => ({
          employeeId: row.employeeId,
          courseId: row.courseId,
          courseCode: row.courseCode,
          courseTitle: row.courseTitle,
          progressStatus: row.progressStatus ?? "not_started",
          completedAt: row.completedAt?.toISOString() ?? null,
          isMandatory: row.isMandatory,
        }),
      );
  });
}

export type HrLmsOnboardingCompletionRow = {
  employeeId: string;
  pathId: string;
  pathCode: string;
  pathName: string;
  progressStatus: string;
  completionPercent: string;
};

export async function getHrLmsOnboardingCompletionSnapshot(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const paths = await db
      .select()
      .from(hrLmsLearningPaths)
      .where(
        and(
          eq(hrLmsLearningPaths.organizationId, input.organizationId),
          eq(hrLmsLearningPaths.pathKind, "onboarding"),
        ),
      );

    if (paths.length === 0) {
      return [] as HrLmsOnboardingCompletionRow[];
    }

    const pathIds = paths.map((path) => path.id);
    const pathCourses = await db
      .select()
      .from(hrLmsLearningPathCourses)
      .where(
        and(
          eq(hrLmsLearningPathCourses.organizationId, input.organizationId),
          or(...pathIds.map((pathId) => eq(hrLmsLearningPathCourses.pathId, pathId)))!,
        ),
      );

    const assignments = await db
      .select()
      .from(hrLmsAssignments)
      .where(
        and(
          eq(hrLmsAssignments.organizationId, input.organizationId),
          or(...pathIds.map((pathId) => eq(hrLmsAssignments.pathId, pathId)))!,
        ),
      );

    const progressRows = await db
      .select()
      .from(hrLmsProgress)
      .where(eq(hrLmsProgress.organizationId, input.organizationId));

    return assignments
      .filter((assignment) =>
        input.employeeIds
          ? input.employeeIds.includes(assignment.employeeId)
          : true,
      )
      .map((assignment) => {
        const path = paths.find((row) => row.id === assignment.pathId);
        const coursesForPath = pathCourses.filter(
          (row) => row.pathId === assignment.pathId,
        );
        const courseIds = coursesForPath.map((row) => row.courseId);
        const employeeProgress = progressRows.filter(
          (row) =>
            row.employeeId === assignment.employeeId &&
            courseIds.includes(row.courseId),
        );
        const avgPercent =
          employeeProgress.length === 0
            ? "0"
            : (
                employeeProgress.reduce(
                  (sum, row) => sum + Number(row.completionPercent),
                  0,
                ) / employeeProgress.length
              ).toFixed(2);
        const allCompleted =
          employeeProgress.length > 0 &&
          employeeProgress.every((row) => row.progressStatus === "completed");

        return {
          employeeId: assignment.employeeId,
          pathId: path?.id ?? assignment.pathId ?? "",
          pathCode: path?.code ?? "",
          pathName: path?.name ?? "",
          progressStatus: allCompleted ? "completed" : "in_progress",
          completionPercent: avgPercent,
        } satisfies HrLmsOnboardingCompletionRow;
      });
  });
}

export type HrLmsTrainingDevelopmentRef = {
  employeeId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  certificationStatus: string | null;
  completedAt: string | null;
};

export async function getHrLmsTrainingDevelopmentRefs(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        employeeId: hrLmsProgress.employeeId,
        courseId: hrLmsCourses.id,
        courseCode: hrLmsCourses.code,
        courseTitle: hrLmsCourses.title,
        completedAt: hrLmsProgress.completedAt,
        certificationStatus: hrLmsCertifications.certificationStatus,
      })
      .from(hrLmsProgress)
      .innerJoin(hrLmsCourses, eq(hrLmsProgress.courseId, hrLmsCourses.id))
      .leftJoin(
        hrLmsCertifications,
        and(
          eq(hrLmsCertifications.organizationId, input.organizationId),
          eq(hrLmsCertifications.employeeId, hrLmsProgress.employeeId),
          eq(hrLmsCertifications.courseId, hrLmsProgress.courseId),
        ),
      )
      .where(
        and(
          eq(hrLmsProgress.organizationId, input.organizationId),
          eq(hrLmsProgress.progressStatus, "completed"),
        ),
      )
      .orderBy(desc(hrLmsProgress.completedAt));

    return rows
      .filter((row) =>
        input.employeeIds ? input.employeeIds.includes(row.employeeId) : true,
      )
      .map(
        (row): HrLmsTrainingDevelopmentRef => ({
          employeeId: row.employeeId,
          courseId: row.courseId,
          courseCode: row.courseCode,
          courseTitle: row.courseTitle,
          certificationStatus: row.certificationStatus ?? null,
          completedAt: row.completedAt?.toISOString() ?? null,
        }),
      );
  });
}

export async function listHrLmsAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
}) {
  const limit = clampPageSize(input.limit ?? DEFAULT_PAGE_SIZE);
  const offset = input.offset ?? 0;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClause = eq(hrLmsAuditEvents.organizationId, input.organizationId);

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(hrLmsAuditEvents)
        .where(whereClause)
        .orderBy(desc(hrLmsAuditEvents.occurredAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(hrLmsAuditEvents).where(whereClause),
    ]);

    return buildPaginatedWindow({
      rows,
      totalCount: Number(totalRows[0]?.count ?? 0),
      pageSize: limit,
      offset,
    });
  });
}

export async function listHrLmsRemindersForEmployee(input: {
  organizationId: string;
  employeeId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrLmsReminders)
      .where(
        and(
          eq(hrLmsReminders.organizationId, input.organizationId),
          eq(hrLmsReminders.employeeId, input.employeeId),
        ),
      )
      .orderBy(desc(hrLmsReminders.createdAt)),
  );
}
