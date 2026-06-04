import { describe, expect, it } from "vitest";

import { buildHrLamAttendanceDaysListSurface } from "../../src/time-attendance/leave-attendance-management/hr.time.lam-attendance-days-list.surface";
import { hrLamAttendanceDaysSurfaceKey } from "../../src/time-attendance/leave-attendance-management/hr.time.lam-surface-metadata.shared";

describe("hr lam list eui contract", () => {
  it("builds attendance days list surface with governed schema version", () => {
    const surface = buildHrLamAttendanceDaysListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
    });

    expect(surface.__schemaVersion).toBeTruthy();
    expect(surface.dataNature).toBe("table");
    expect(surface.surface.columnsId).toBeTruthy();
    expect(hrLamAttendanceDaysSurfaceKey).toBe("hr.time.lam.attendance_days.list");
  });
});
