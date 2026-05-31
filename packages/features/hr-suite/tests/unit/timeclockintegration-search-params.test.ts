import { describe, expect, it } from "vitest";

import { parseHrTimeClockSearchParams } from "../../src/time-attendance/time-clock-integration/data/hr.time.clock-integration-search-params.parse.shared";

describe("timeclockintegration search params", () => {
  it("parses legacy timeClockSearch fallback", () => {
    expect(parseHrTimeClockSearchParams({ timeClockSearch: "shared" })).toEqual({
      devicesSearch: "shared",
      mappingsSearch: "shared",
      rawPunchesSearch: "shared",
      punchExceptionsSearch: "shared",
      syncBatchesSearch: "shared",
      lamExportSearch: "shared",
      overtimeRefsSearch: "shared",
      payrollRefsSearch: "shared",
      auditTrailSearch: "shared",
      reportGroupBy: undefined,
      search: "shared",
    });
  });
});
