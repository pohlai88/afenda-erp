import {
  listHrLmsAssignmentsFromStore,
  listHrLmsCertificationsFromStore,
  listHrLmsCoursesFromStore,
  listHrLmsEnrollmentsFromStore,
  listHrLmsProgressFromStore,
  listHrLmsRemindersFromStore,
  shouldUseHrLmsStoreFallback,
} from "./hr.talent.lms-store.shared";

function getLmsComplianceCompletionSnapshotFromStore(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  const courses = listHrLmsCoursesFromStore(input.organizationId);
  const assignments = listHrLmsAssignmentsFromStore(
    input.organizationId,
  ).filter((row) => row.isComplianceMandatory);
  const progress = listHrLmsProgressFromStore(
    input.organizationId,
    input.employeeIds,
  );

  return assignments
    .filter((row) =>
      input.employeeIds ? input.employeeIds.includes(row.employeeId) : true,
    )
    .map((assignment) => {
      const course = courses.find((row) => row.id === assignment.courseId);
      const row = progress.find(
        (entry) =>
          entry.employeeId === assignment.employeeId &&
          entry.courseId === assignment.courseId,
      );
      return {
        employeeId: assignment.employeeId,
        courseId: assignment.courseId ?? "",
        courseCode: course?.code ?? "",
        courseTitle: course?.title ?? "",
        progressStatus: row?.progressStatus ?? "not_started",
        completedAt: row?.completedAt ?? null,
        isMandatory: assignment.isComplianceMandatory,
      };
    });
}

export async function getLmsComplianceCompletionSnapshot(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  if (shouldUseHrLmsStoreFallback()) {
    return getLmsComplianceCompletionSnapshotFromStore(input);
  }

  try {
    const { getHrLmsComplianceCompletionSnapshot } = await import("@afenda/db");
    return await getHrLmsComplianceCompletionSnapshot(input);
  } catch {
    return getLmsComplianceCompletionSnapshotFromStore(input);
  }
}

export async function getLmsOnboardingCompletionSnapshot(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  if (shouldUseHrLmsStoreFallback()) {
    return [];
  }

  try {
    const { getHrLmsOnboardingCompletionSnapshot } = await import("@afenda/db");
    return await getHrLmsOnboardingCompletionSnapshot(input);
  } catch {
    return [];
  }
}

function getLmsTrainingDevelopmentRefsFromStore(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  const courses = listHrLmsCoursesFromStore(input.organizationId);
  const progress = listHrLmsProgressFromStore(
    input.organizationId,
    input.employeeIds,
  ).filter((row) => row.progressStatus === "completed");
  const certifications = listHrLmsCertificationsFromStore(input.organizationId);

  return progress.map((row) => {
    const course = courses.find((entry) => entry.id === row.courseId);
    const cert = certifications.find(
      (entry) =>
        entry.employeeId === row.employeeId && entry.courseId === row.courseId,
    );
    return {
      employeeId: row.employeeId,
      courseId: row.courseId,
      courseCode: course?.code ?? "",
      courseTitle: course?.title ?? "",
      certificationStatus: cert?.certificationStatus ?? null,
      completedAt: row.completedAt ?? null,
    };
  });
}

export async function getLmsTrainingDevelopmentRefs(input: {
  organizationId: string;
  employeeIds?: readonly string[] | null;
}) {
  if (shouldUseHrLmsStoreFallback()) {
    return getLmsTrainingDevelopmentRefsFromStore(input);
  }

  try {
    const { getHrLmsTrainingDevelopmentRefs } = await import("@afenda/db");
    return await getHrLmsTrainingDevelopmentRefs(input);
  } catch {
    return getLmsTrainingDevelopmentRefsFromStore(input);
  }
}

export function listHrLmsComplianceTrainingFromStore(organizationId: string) {
  return listHrLmsAssignmentsFromStore(organizationId).filter(
    (row) => row.isComplianceMandatory,
  );
}

export function listHrLmsPendingEnrollmentsFromStore(organizationId: string) {
  return listHrLmsEnrollmentsFromStore(organizationId).filter(
    (row) => row.enrollmentStatus === "pending_approval",
  );
}

export function listHrLmsActiveRemindersFromStore(organizationId: string) {
  return listHrLmsRemindersFromStore(organizationId);
}
