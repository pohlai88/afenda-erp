import type { HrLmsReportGroupBy } from "../schemas/hr.talent.lms-constants.shared";
import {
  listHrLmsAssessmentsFromStore,
  listHrLmsAssignmentsFromStore,
  listHrLmsCertificationsFromStore,
  listHrLmsCoursesFromStore,
  listHrLmsPathsFromStore,
  listHrLmsProgressFromStore,
} from "./hr.talent.lms-store.shared";

const EMPLOYEE_NAMES: Record<string, string> = {
  "emp-001": "Alex Chen",
  "emp-002": "Jordan Lee",
  "emp-003": "Sam Rivera",
};

const DEPARTMENTS: Record<string, string> = {
  "emp-001": "Engineering",
  "emp-002": "Operations",
  "emp-003": "Finance",
};

export type HrLmsReportRow = {
  groupKey: string;
  groupLabel: string;
  rowCount: number;
  completionPercent: number;
  overdueCount: number;
};

export function buildHrLmsReportRows(input: {
  organizationId: string;
  groupBy: HrLmsReportGroupBy;
  visibleEmployeeIds?: readonly string[] | null;
}): HrLmsReportRow[] {
  const courses = listHrLmsCoursesFromStore(input.organizationId);
  const paths = listHrLmsPathsFromStore(input.organizationId);
  const progress = listHrLmsProgressFromStore(
    input.organizationId,
    input.visibleEmployeeIds,
  );
  const certifications = listHrLmsCertificationsFromStore(input.organizationId);
  const assignments = listHrLmsAssignmentsFromStore(input.organizationId);

  const buckets = new Map<string, HrLmsReportRow>();

  function upsert(groupKey: string, groupLabel: string, mutate: (row: HrLmsReportRow) => void) {
    const existing = buckets.get(groupKey) ?? {
      groupKey,
      groupLabel,
      rowCount: 0,
      completionPercent: 0,
      overdueCount: 0,
    };
    mutate(existing);
    buckets.set(groupKey, existing);
  }

  for (const row of progress) {
    const course = courses.find((entry) => entry.id === row.courseId);
    const employeeName = EMPLOYEE_NAMES[row.employeeId] ?? row.employeeId;
    const department = DEPARTMENTS[row.employeeId] ?? "Unknown";

    if (input.groupBy === "employee") {
      upsert(row.employeeId, employeeName, (bucket) => {
        bucket.rowCount += 1;
        bucket.completionPercent += row.completionPercent;
        if (row.progressStatus === "overdue") bucket.overdueCount += 1;
      });
    } else if (input.groupBy === "course" && course) {
      upsert(course.id, course.title, (bucket) => {
        bucket.rowCount += 1;
        bucket.completionPercent += row.completionPercent;
      });
    } else if (input.groupBy === "department") {
      upsert(department, department, (bucket) => {
        bucket.rowCount += 1;
        bucket.completionPercent += row.completionPercent;
      });
    } else if (input.groupBy === "status") {
      upsert(row.progressStatus, row.progressStatus, (bucket) => {
        bucket.rowCount += 1;
      });
    } else if (input.groupBy === "provider" && course) {
      upsert(course.provider, course.provider, (bucket) => {
        bucket.rowCount += 1;
        bucket.completionPercent += row.completionPercent;
      });
    }
  }

  if (input.groupBy === "learning_path") {
    for (const path of paths) {
      upsert(path.id, path.name, (bucket) => {
        bucket.rowCount = path.courseIds.length;
      });
    }
  }

  if (input.groupBy === "certification") {
    for (const cert of certifications) {
      upsert(cert.id, cert.certificateCode, (bucket) => {
        bucket.rowCount += 1;
      });
    }
  }

  if (input.groupBy === "manager") {
    upsert("mgr-001", "Manager Team A", (bucket) => {
      bucket.rowCount = assignments.length;
    });
  }

  if (input.groupBy === "period") {
    upsert("2026-Q2", "2026 Q2", (bucket) => {
      bucket.rowCount = progress.length;
      bucket.completionPercent = progress.reduce(
        (sum, row) => sum + row.completionPercent,
        0,
      );
    });
  }

  return [...buckets.values()].map((row) => ({
    ...row,
    completionPercent:
      row.rowCount === 0
        ? 0
        : Math.round(row.completionPercent / row.rowCount),
  }));
}

export function listHrLmsLearningHistory(input: {
  organizationId: string;
  employeeId?: string;
  courseId?: string;
  pathId?: string;
  provider?: string;
  periodStart?: string;
  periodEnd?: string;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const progress = listHrLmsProgressFromStore(
    input.organizationId,
    input.visibleEmployeeIds,
  );
  const courses = listHrLmsCoursesFromStore(input.organizationId);
  const paths = listHrLmsPathsFromStore(input.organizationId);
  const assessments = listHrLmsAssessmentsFromStore(input.organizationId);
  const certifications = listHrLmsCertificationsFromStore(input.organizationId);

  return progress
    .filter((row) => (input.employeeId ? row.employeeId === input.employeeId : true))
    .filter((row) => (input.courseId ? row.courseId === input.courseId : true))
    .filter((row) => {
      if (!input.pathId) return true;
      const path = paths.find((entry) => entry.id === input.pathId);
      return path?.courseIds.includes(row.courseId) ?? false;
    })
    .filter((row) => {
      if (!input.provider) return true;
      const course = courses.find((entry) => entry.id === row.courseId);
      return course?.provider === input.provider;
    })
    .map((row) => {
      const course = courses.find((entry) => entry.id === row.courseId);
      const attempt = assessments.find((entry) => entry.enrollmentId === row.enrollmentId);
      const cert = certifications.find(
        (entry) =>
          entry.employeeId === row.employeeId && entry.courseId === row.courseId,
      );
      return {
        employeeId: row.employeeId,
        courseId: row.courseId,
        courseCode: course?.code ?? "",
        courseTitle: course?.title ?? "",
        provider: course?.provider ?? "",
        progressStatus: row.progressStatus,
        completionPercent: row.completionPercent,
        lastAccessedAt: row.lastAccessedAt ?? null,
        assessmentResult: attempt?.result ?? null,
        certificationStatus: cert?.certificationStatus ?? null,
      };
    });
}
