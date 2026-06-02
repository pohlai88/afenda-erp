import { LYNX_ERP_HTTP_ROUTES } from "@afenda/feature-lynx";
import { describe, expect, it } from "vitest";
import {
  buildLynxRunFilterSearchParams,
  parseLynxRunFilters,
} from "@/lib/api/lynx-run-filters";

describe("lynx run filters", () => {
  it("keeps only supported status values", () => {
    expect(parseLynxRunFilters({ status: "completed" }).status).toBe(
      "completed",
    );
    expect(parseLynxRunFilters({ status: "unknown" }).status).toBeUndefined();
  });

  it("serializes active filters for export links", () => {
    const params = buildLynxRunFilterSearchParams({
      filters: {
        status: "failed",
        route: LYNX_ERP_HTTP_ROUTES.operator,
        toolName: "inspectLynxReadiness",
      },
    });

    expect(params.get("status")).toBe("failed");
    expect(params.get("route")).toBe(LYNX_ERP_HTTP_ROUTES.operator);
    expect(params.get("toolName")).toBe("inspectLynxReadiness");
  });

  it("supports quality gate filters", () => {
    const filters = parseLynxRunFilters({
      qualityGate: "failedQualityGate",
    });
    const params = buildLynxRunFilterSearchParams({ filters });

    expect(filters.qualityGate).toBe("failedQualityGate");
    expect(params.get("qualityGate")).toBe("failedQualityGate");
    expect(
      parseLynxRunFilters({ qualityGate: "unknown" }).qualityGate,
    ).toBeUndefined();
  });
});
