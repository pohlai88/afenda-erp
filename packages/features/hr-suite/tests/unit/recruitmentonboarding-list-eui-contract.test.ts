import { describe, expect, it } from "vitest";

import { hrTalentRonReadPermission } from "../../src/talent-management/recruitment-onboarding/contracts/hr.talent.ron.contract";
import {
  buildHrRonApplicationsListSurface,
  buildHrRonRequisitionsListSurface,
} from "../../src/talent-management/recruitment-onboarding/surface/hr.talent.ron-lists.surface";
import { resetHrRonStoreForTests } from "../../src/talent-management/recruitment-onboarding/data/hr.talent.ron-store.shared";
import {
  hrRonApplicationsSurfaceKey,
  hrRonRequisitionsSearchParam,
  hrRonRequisitionsSurfaceKey,
} from "../../src/talent-management/recruitment-onboarding/data/hr.talent.ron-search-params.parse.shared";

describe("recruitment onboarding list EUI contract", () => {
  const store = resetHrRonStoreForTests("org-ron-eui");
  const candidateNames = new Map(
    store.candidates.map((candidate) => [candidate.id, candidate.displayName]),
  );

  it("builds requisition list surface with governed metadata and search toolbar", () => {
    const surface = buildHrRonRequisitionsListSurface({
      surfaceKey: hrRonRequisitionsSurfaceKey,
      rows: store.requisitions,
      searchValue: "ops",
    });

    expect(surface.__schemaVersion).toBeTruthy();
    expect(surface.dataNature).toBe("table");
    expect(surface.requiresErpPermission).toEqual(hrTalentRonReadPermission);
    expect(surface.presentation!.toolbar?.search?.param).toBe(
      hrRonRequisitionsSearchParam,
    );
    expect(surface.presentation!.toolbar?.search?.value).toBe("ops");
    expect(surface.surface.header.title).toBe("Job requisitions");
    expect(surface.surface.columnsId).toBe(hrRonRequisitionsSurfaceKey);
    expect(surface.surface.rowKey).toBe("id");
    expect(surface.pagination!.totalCount).toBe(1);
  });

  it("builds application rows with route-safe row hrefs", () => {
    const surface = buildHrRonApplicationsListSurface({
      surfaceKey: hrRonApplicationsSurfaceKey,
      requisitions: store.requisitions,
      rows: store.applications,
      candidateNames,
    });

    expect(surface.rows[0]?.rowHref).toBe(
      `/hr/recruitment-onboarding/applications/${store.applications[0]?.id}`,
    );
    expect(surface.rows[0]?.cells.candidate).toBe("Avery Chen");
  });
});
