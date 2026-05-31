import { describe, expect, it } from "vitest";

import { buildHrTimeClockDevicesListSurface } from "../../src/time-attendance/time-clock-integration/surface/hr.time.clock-integration-devices-list.surface";
import { hrTimeClockDevicesSurfaceKey } from "../../src/time-attendance/time-clock-integration/surface/hr.time.clock-integration-devices-list.surface";

describe("hr timeclockintegration list eui contract", () => {
  it("builds devices list surface with governed schema version", () => {
    const surface = buildHrTimeClockDevicesListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        offset: 0,
        hasMore: false,
      },
      canAdmin: false,
    });

    expect(surface.__schemaVersion).toBeTruthy();
    expect(surface.dataNature).toBe("table");
    expect(surface.surface.columnsId).toBeTruthy();
    expect(hrTimeClockDevicesSurfaceKey).toBe(
      "hr.time.clock-integration.devices.list",
    );
  });
});
