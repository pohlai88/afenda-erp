import { describe, expect, it } from "vitest";

import { parseHrLamSearchParams } from "../../src/time-attendance/leave-attendance-management/hr.time.lam-search-params.parse.shared";

describe("hr lam search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrLamSearchParams(undefined)).toEqual({});
  });

  it("parses list-specific search params from URL keys", () => {
    expect(
      parseHrLamSearchParams({
        lamAttendanceDaysSearch: "attendance-query",
        lamLeaveRequestsSearch: "leave-query",
        lamLeaveBalancesSearch: "balance-query",
      }),
    ).toEqual({
      attendanceDaysSearch: "attendance-query",
      leaveRequestsSearch: "leave-query",
      leaveBalancesSearch: "balance-query",
    });
  });
});
