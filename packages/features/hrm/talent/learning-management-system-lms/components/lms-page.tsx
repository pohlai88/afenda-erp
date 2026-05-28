import { getFormatter, getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"
import { HrmAccessDeniedMessage } from "../../../_core/registry"
import { requireOrgSession } from "@afenda/platform/auth"

import { submitAssignLms } from "../actions/lms-assignment.actions"
import {
  submitCreateLmsAssessment,
  submitLmsAssessmentAttempt,
} from "../actions/lms-assessment.actions"
import {
  submitIssueLmsCertificate,
  submitRenewLmsCertificate,
} from "../actions/lms-certificate.actions"
import { submitArchiveLmsCourse } from "../actions/lms-course.actions"
import { submitCreateLmsLesson } from "../actions/lms-lesson.actions"
import { submitArchiveLmsLearningPath } from "../actions/lms-learning-path.actions"
import {
  submitApproveLmsEnrollment,
  submitRejectLmsEnrollment,
  submitSelfEnrollLmsCourse,
} from "../actions/lms-enrollment.actions"
import { submitAdvanceLmsLesson } from "../actions/lms-progress.actions"
import { listLmsAssignmentsForOrg } from "../data/lms-assignments.queries.server"
import { listLmsCertificatesForOrg } from "../data/lms-certificates.queries.server"
import { listLmsCompletedEnrollmentChoicesForOrg } from "../data/lms-completed-enrollments.queries.server"
import { listLmsCoursesForOrg } from "../data/lms-courses.queries.server"
import {
  listLmsEnrollmentsForEmployee,
  listLmsPendingEnrollmentsForOrg,
} from "../data/lms-enrollments.queries.server"
import { listLmsLearningPathsForOrg } from "../data/lms-learning-paths.queries.server"
import { listLmsProgressForOrg } from "../data/lms-progress.queries.server"
import { listLmsPlayerEnrollmentsForEmployee } from "../data/lms-progress.queries.server"
import { listLmsReminderRowsForOrg } from "../data/lms-reminders.queries.server"
import type { LmsSurfaceAccess } from "../data/lms-access.server"
import {
  buildLmsEmployeeOverviewSnapshot,
  buildLmsManagerOverviewSnapshot,
  buildLmsOverviewSnapshot,
} from "../data/lms-overview.queries.server"
import {
  findLmsManagerContextForUser,
  listLmsDirectReportEmployeeIds,
} from "../data/lms-manager-context.server"
import { listLmsLearningHistoryForOrg } from "../data/lms-learning-history.queries.server"
import { listLmsAuditTrailForOrg } from "../data/lms-audit-trail.server"
import { listHrmLmsSpecDeliveryRows } from "../lms-spec-status.shared"
import {
  findLeaveEmployeeForUser,
  listActiveEmployeeChoicesForLeave,
} from "../../../time-attendance/server"

import { LmsAssignmentSection } from "./lms-assignment-section"
import { LmsCatalogSection } from "./lms-catalog-section"
import { LmsCertificatesSection } from "./lms-certificates-section"
import { LmsCourseAdminForms } from "./lms-course-admin-forms"
import { LmsCoursePlayerSection } from "./lms-course-player-section"
import { LmsCurriculumAdminForms } from "./lms-curriculum-admin-forms"
import { LmsEnrollmentApprovalSection } from "./lms-enrollment-approval-section"
import { LmsLearningPathAdminForms } from "./lms-learning-path-admin-forms"
import { LmsLearningPathsSection } from "./lms-learning-paths-section"
import { LmsMyLearningSection } from "./lms-my-learning-section"
import { LmsProgressSection } from "./lms-progress-section"
import { LmsRemindersSection } from "./lms-reminders-section"
import { LmsOverviewSection } from "./lms-overview-section"
import {
  LMS_OVERVIEW_EMPLOYEE_SURFACE_KEY,
  LMS_OVERVIEW_HR_SURFACE_KEY,
  LMS_OVERVIEW_MANAGER_SURFACE_KEY,
} from "../data/lms-overview-surface.server"
import { LmsLearningHistorySection } from "./lms-learning-history-section"
import { LmsReportsSection } from "./lms-reports-section"
import { LmsAuditTrailSection } from "./lms-audit-trail-section"
import type { LmsReportCatalogRow } from "../data/lms-reports-list-surface.server"

type LmsPageProps = {
  orgSlug: string
  organizationId: string
  access: LmsSurfaceAccess
}

export async function LmsPage({
  orgSlug,
  organizationId,
  access,
}: LmsPageProps) {
  const t = await getTranslations("Erp.Hrm.lms")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const session = await requireOrgSession()

  const managerContextPromise =
    access.canViewManagerOverview && !access.canViewHrOverview
      ? findLmsManagerContextForUser({
          organizationId,
          userId: session.userId,
        })
      : Promise.resolve(null)

  const [
    format,
    courses,
    paths,
    assignments,
    pendingEnrollments,
    employees,
    linkedEmployee,
    progressRows,
    certificates,
    reminders,
    completedEnrollmentChoices,
    managerContext,
  ] = await Promise.all([
    getFormatter(),
    listLmsCoursesForOrg(organizationId),
    listLmsLearningPathsForOrg(organizationId),
    listLmsAssignmentsForOrg(organizationId),
    listLmsPendingEnrollmentsForOrg(organizationId),
    access.canManage
      ? listActiveEmployeeChoicesForLeave(organizationId)
      : Promise.resolve([]),
    findLeaveEmployeeForUser(organizationId, session.userId),
    access.canRead
      ? listLmsProgressForOrg(organizationId)
      : Promise.resolve([]),
    access.canRead
      ? listLmsCertificatesForOrg(organizationId)
      : Promise.resolve([]),
    access.canRead
      ? listLmsReminderRowsForOrg(organizationId)
      : Promise.resolve([]),
    access.canManage
      ? listLmsCompletedEnrollmentChoicesForOrg(organizationId)
      : Promise.resolve([]),
    managerContextPromise,
  ])

  const directReportIds =
    managerContext != null
      ? await listLmsDirectReportEmployeeIds({
          organizationId,
          managerEmployeeId: managerContext.employeeId,
        })
      : []

  const historyEmployeeIds: string[] | undefined = access.canViewHrOverview
    ? undefined
    : managerContext != null
      ? [...new Set([managerContext.employeeId, ...directReportIds])]
      : linkedEmployee
        ? [linkedEmployee.id]
        : undefined

  const canLoadLearningHistory =
    access.canViewLearningHistory &&
    (historyEmployeeIds === undefined || historyEmployeeIds.length > 0)

  const [
    employeeOverview,
    managerOverview,
    hrOverview,
    learningHistory,
    auditTrail,
  ] = await Promise.all([
    linkedEmployee && access.canViewEmployeeOverview
      ? buildLmsEmployeeOverviewSnapshot({
          organizationId,
          employeeId: linkedEmployee.id,
        })
      : Promise.resolve(null),
    managerContext && access.canViewManagerOverview
      ? buildLmsManagerOverviewSnapshot({
          organizationId,
          managerEmployeeId: managerContext.employeeId,
        })
      : Promise.resolve(null),
    access.canViewHrOverview
      ? buildLmsOverviewSnapshot({ organizationId })
      : Promise.resolve(null),
    canLoadLearningHistory
      ? listLmsLearningHistoryForOrg({
          organizationId,
          employeeIds: historyEmployeeIds,
        })
      : Promise.resolve([]),
    access.canAudit
      ? listLmsAuditTrailForOrg(organizationId)
      : Promise.resolve([]),
  ])

  const [myEnrollments, playerEnrollments] = linkedEmployee
    ? await Promise.all([
        listLmsEnrollmentsForEmployee({
          organizationId,
          employeeId: linkedEmployee.id,
        }),
        listLmsPlayerEnrollmentsForEmployee({
          organizationId,
          employeeId: linkedEmployee.id,
        }),
      ])
    : [[], []]

  const selfEnrollCourses = courses.filter(
    (c) => c.state === "active" && c.selfEnrollAllowed
  )

  const specRows = listHrmLmsSpecDeliveryRows()

  const formatDate = (value: Date) =>
    format.dateTime(value, { dateStyle: "medium" })

  const catalogLabels = {
    catalogTitle: t("catalogTitle"),
    catalogDescription: t("catalogDescription"),
    colCode: t("colCode"),
    colTitle: t("colTitle"),
    colType: t("colType"),
    colDelivery: t("colDelivery"),
    colRefs: t("colRefs"),
    colState: t("colState"),
    empty: t("catalogEmpty"),
    archive: t("archiveCourse"),
    formatCourseType: (courseType: string) =>
      t(`courseType.${courseType}` as "courseType.online_course"),
  }

  const pathLabels = {
    pathsTitle: t("pathsTitle"),
    pathsDescription: t("pathsDescription"),
    colCode: t("colCode"),
    colName: t("colPathName"),
    colType: t("colPathType"),
    colCourses: t("colPathCourses"),
    colState: t("colState"),
    empty: t("pathsEmpty"),
    archive: t("archivePath"),
    formatPathType: (pathType: string) =>
      t(`pathType.${pathType}` as "pathType.role"),
  }

  const assignmentLabels = {
    boardTitle: t("assignmentsTitle"),
    boardDescription: t("assignmentsDescription"),
    empty: t("assignmentsEmpty"),
    colEmployee: t("colEmployee"),
    colTarget: t("colTarget"),
    colMandatory: t("colMandatory"),
    colApproval: t("colApproval"),
    colAssigned: t("colAssigned"),
    assign: t("assignSubmit"),
    assignTargetCourse: t("assignTargetCourse"),
    assignTargetPath: t("assignTargetPath"),
    formatAssigned: formatDate,
    formatMandatory: (mandatory: boolean) =>
      mandatory ? t("mandatoryYes") : t("mandatoryNo"),
    formatApproval: (state: string | null) =>
      state ? t(`approvalState.${state}` as "approvalState.approved") : "—",
  }

  const approvalLabels = {
    queueTitle: t("enrollmentQueueTitle"),
    queueDescription: t("enrollmentQueueDescription"),
    empty: t("enrollmentQueueEmpty"),
    colEmployee: t("colEmployee"),
    colTarget: t("colTarget"),
    colMandatory: t("colMandatory"),
    colEnrolled: t("colEnrolled"),
    approve: t("approveEnrollment"),
    reject: t("rejectEnrollment"),
    formatEnrolled: formatDate,
    formatMandatory: (mandatory: boolean | null) =>
      mandatory == null
        ? "—"
        : mandatory
          ? t("mandatoryYes")
          : t("mandatoryNo"),
  }

  const progressLabels = {
    empty: t("progressEmpty"),
    colEmployee: t("colEmployee"),
    colTarget: t("colTarget"),
    colStatus: t("colState"),
    colPercent: t("colPercent"),
    colTime: t("colTimeSpent"),
    colLastAccessed: t("colLastAccessed"),
    formatStatus: (status: string) =>
      t(`progressStatus.${status}` as "progressStatus.in_progress"),
    formatPercent: (value: number) => `${value}%`,
    formatMinutes: (value: number) => t("minutesSpent", { minutes: value }),
    formatLastAccessed: (value: Date | null) =>
      value ? formatDate(value) : "—",
  }

  const certificateLabels = {
    boardTitle: t("certificatesTitle"),
    boardDescription: t("certificatesDescription"),
    empty: t("certificatesEmpty"),
    colEmployee: t("colEmployee"),
    colTarget: t("colTarget"),
    colStatus: t("colState"),
    colRef: t("colCertificateRef"),
    colIssued: t("colIssued"),
    colExpires: t("colExpires"),
    colRenewal: t("colRenewalDue"),
    renew: t("renewCertificate"),
    formatStatus: (status: string) =>
      t(`certificateStatus.${status}` as "certificateStatus.issued"),
    formatDate: (value: Date | null) => (value ? formatDate(value) : "—"),
  }

  const reminderLabels = {
    empty: t("remindersEmpty"),
    colEmployee: t("colEmployee"),
    colKind: t("colReminderKind"),
    colTarget: t("colTarget"),
    colDetail: t("colReminderDetail"),
    formatKind: (kind: "progress_overdue" | "certificate_expiring") =>
      t(`reminderKind.${kind}`),
  }

  const curriculumLabels = {
    lessonsTitle: t("lessonsAdminTitle"),
    lessonsDescription: t("lessonsAdminDescription"),
    lessonSubmit: t("lessonSubmit"),
    assessmentsTitle: t("assessmentsAdminTitle"),
    assessmentsDescription: t("assessmentsAdminDescription"),
    assessmentSubmit: t("assessmentSubmit"),
    issueCertTitle: t("issueCertificateTitle"),
    issueCertDescription: t("issueCertificateDescription"),
    issueCertSubmit: t("issueCertificateSubmit"),
    fieldCode: t("fieldCode"),
    fieldTitle: t("fieldTitle"),
    fieldCourse: t("fieldCourse"),
    fieldCoursePlaceholder: t("fieldCoursePlaceholder"),
    fieldEstimatedMinutes: t("fieldEstimatedMinutes"),
    fieldPassingScore: t("fieldPassingScore"),
    fieldMaxAttempts: t("fieldMaxAttempts"),
    fieldEnrollment: t("fieldEnrollment"),
    fieldEnrollmentPlaceholder: t("fieldEnrollmentPlaceholder"),
    fieldCertificateRef: t("fieldCertificateRef"),
  }

  const playerLabels = {
    playerTitle: t("coursePlayerTitle"),
    playerDescription: t("coursePlayerDescription"),
    playerEmpty: t("coursePlayerEmpty"),
    lessonsHeading: t("coursePlayerLessons"),
    assessmentsHeading: t("coursePlayerAssessments"),
    markLessonComplete: t("markLessonComplete"),
    submitAssessment: t("submitAssessmentAttempt"),
    fieldScore: t("fieldScore"),
    colPercent: t("colPercent"),
    colStatus: t("colState"),
    formatPercent: (value: number) => `${value}%`,
    formatStatus: (status: string) =>
      t(`progressStatus.${status}` as "progressStatus.in_progress"),
  }

  const overviewKpiBase = {
    activeCourses: t("kpiActiveCourses"),
    enrollments: t("kpiEnrollments"),
    inProgress: t("kpiInProgress"),
    completed: t("kpiCompleted"),
    overdue: t("kpiOverdue"),
    certificates: t("kpiCertificates"),
    pendingApprovals: t("kpiPendingApprovals"),
  }

  const historyLabels = {
    empty: t("learningHistoryEmpty"),
    colEmployee: t("colEmployee"),
    colOccurred: t("colOccurred"),
    colKind: t("colEventKind"),
    colTarget: t("colTarget"),
    colDetail: t("colReminderDetail"),
    formatOccurred: formatDate,
    formatKind: (
      kind: "enrollment" | "progress" | "assessment" | "certificate"
    ) => t(`historyKind.${kind}`),
  }

  const reportCatalogRows: LmsReportCatalogRow[] = [
    {
      id: "progress",
      reportKey: "progress",
      label: t("reportProgressLabel"),
      description: t("reportProgressDescription"),
    },
  ]

  const reportsLabels = {
    empty: t("reportsEmpty"),
    colReport: t("colReport"),
    colDescription: t("colReportDescription"),
  }

  const myLearningLabels = {
    myLearningTitle: t("myLearningTitle"),
    myLearningDescription: t("myLearningDescription"),
    empty: t("myLearningEmpty"),
    colTarget: t("colTarget"),
    colApproval: t("colApproval"),
    colMandatory: t("colMandatory"),
    colEnrolled: t("colEnrolled"),
    selfEnroll: t("selfEnrollSubmit"),
    fieldCoursePlaceholder: t("fieldCoursePlaceholder"),
    formatEnrolled: formatDate,
    formatApproval: (state: string) =>
      t(`approvalState.${state}` as "approvalState.approved"),
    formatMandatory: (mandatory: boolean | null) =>
      mandatory == null
        ? "—"
        : mandatory
          ? t("mandatoryYes")
          : t("mandatoryNo"),
  }

  return (
    <div className="flex flex-col gap-6" data-testid="lms-page">
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      />

      {employeeOverview ? (
        <LmsOverviewSection
          snapshot={employeeOverview}
          surfaceKey={LMS_OVERVIEW_EMPLOYEE_SURFACE_KEY}
          copy={{
            title: t("overviewEmployeeTitle"),
            ...overviewKpiBase,
          }}
        />
      ) : null}

      {managerOverview ? (
        <LmsOverviewSection
          snapshot={managerOverview}
          surfaceKey={LMS_OVERVIEW_MANAGER_SURFACE_KEY}
          copy={{
            title: t("overviewManagerTitle"),
            ...overviewKpiBase,
          }}
        />
      ) : access.canViewManagerOverview && !access.canViewHrOverview ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("overviewManagerTitle")}</CardTitle>
            <CardDescription>{t("overviewNoManagerScope")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {hrOverview ? (
        <LmsOverviewSection
          snapshot={hrOverview}
          surfaceKey={LMS_OVERVIEW_HR_SURFACE_KEY}
          copy={{
            title: t("overviewHrTitle"),
            ...overviewKpiBase,
          }}
        />
      ) : null}

      {canLoadLearningHistory ? (
        <LmsLearningHistorySection
          rows={learningHistory}
          orgSlug={orgSlug}
          title={t("learningHistoryTitle")}
          description={t("learningHistoryDescription")}
          labels={historyLabels}
        />
      ) : null}

      {access.canExportReports || access.canAudit ? (
        <LmsReportsSection
          catalogRows={reportCatalogRows}
          title={t("reportsTitle")}
          description={t("reportsDescription")}
          labels={reportsLabels}
          canExport={access.canExportReports}
        />
      ) : null}

      {access.canAudit ? (
        <LmsAuditTrailSection rows={auditTrail} parentAccessAllowed />
      ) : null}

      <LmsMyLearningSection
        enrollments={myEnrollments}
        selfEnrollCourses={selfEnrollCourses}
        orgSlug={orgSlug}
        organizationId={organizationId}
        canRead={access.canRead}
        showSelfEnroll={Boolean(linkedEmployee)}
        selfEnrollAction={submitSelfEnrollLmsCourse}
        labels={myLearningLabels}
      />

      {linkedEmployee ? (
        <LmsCoursePlayerSection
          orgSlug={orgSlug}
          organizationId={organizationId}
          playerEnrollments={playerEnrollments}
          advanceLessonAction={submitAdvanceLmsLesson}
          submitAssessmentAction={submitLmsAssessmentAttempt}
          labels={playerLabels}
        />
      ) : null}

      {access.canManage ? (
        <>
          <LmsCourseAdminForms
            orgSlug={orgSlug}
            organizationId={organizationId}
            courses={courses}
          />
          <LmsLearningPathAdminForms
            orgSlug={orgSlug}
            organizationId={organizationId}
            courses={courses}
            paths={paths}
          />
          <LmsAssignmentSection
            assignments={assignments}
            courses={courses}
            paths={paths}
            employees={employees}
            orgSlug={orgSlug}
            organizationId={organizationId}
            canManage={access.canManage}
            canRead={access.canRead}
            assignAction={submitAssignLms}
            labels={assignmentLabels}
          />
          <LmsEnrollmentApprovalSection
            pendingEnrollments={pendingEnrollments}
            orgSlug={orgSlug}
            organizationId={organizationId}
            canManage={access.canManage}
            canRead={access.canRead}
            approveAction={submitApproveLmsEnrollment}
            rejectAction={submitRejectLmsEnrollment}
            labels={approvalLabels}
          />
          <LmsCurriculumAdminForms
            orgSlug={orgSlug}
            organizationId={organizationId}
            courses={courses}
            createLessonAction={submitCreateLmsLesson}
            createAssessmentAction={submitCreateLmsAssessment}
            issueCertificateAction={submitIssueLmsCertificate}
            completedEnrollmentChoices={completedEnrollmentChoices}
            labels={curriculumLabels}
          />
        </>
      ) : null}

      {access.canRead ? (
        <>
          <LmsProgressSection
            progressRows={progressRows}
            orgSlug={orgSlug}
            title={t("progressTitle")}
            description={t("progressDescription")}
            labels={progressLabels}
          />
          <LmsCertificatesSection
            certificates={certificates}
            orgSlug={orgSlug}
            organizationId={organizationId}
            canManage={access.canManage}
            canRead={access.canRead}
            renewAction={submitRenewLmsCertificate}
            labels={certificateLabels}
          />
          <LmsRemindersSection
            reminders={reminders}
            orgSlug={orgSlug}
            title={t("remindersTitle")}
            description={t("remindersDescription")}
            labels={reminderLabels}
          />
        </>
      ) : null}

      <LmsCatalogSection
        courses={courses}
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
        canRead={access.canRead}
        archiveAction={submitArchiveLmsCourse}
        labels={catalogLabels}
      />

      <LmsLearningPathsSection
        paths={paths}
        orgSlug={orgSlug}
        organizationId={organizationId}
        canManage={access.canManage}
        canRead={access.canRead}
        archiveAction={submitArchiveLmsLearningPath}
        labels={pathLabels}
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("specDeliveryTitle")}</CardTitle>
          <CardDescription>{t("specDeliveryDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {specRows.map((row) => (
            <Badge
              key={row.code}
              variant={
                row.status === "complete"
                  ? "default"
                  : row.status === "partial"
                    ? "secondary"
                    : "outline"
              }
            >
              {row.code} · {t(`specDeliveryStatus.${row.status}`)}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
