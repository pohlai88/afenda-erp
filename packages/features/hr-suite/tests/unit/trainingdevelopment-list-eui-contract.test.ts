import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrTalentTrainingReadPermission } from "../../src/talent-management/training-development/contracts/hr.talent.training.contract";
import { buildHrTrainingPageModel } from "../../src/talent-management/training-development/data/hr.talent.training.page-model.server";
import {
  getHrTrainingStore,
  listHrTrainingComplianceCompletionRefs,
  resetHrTrainingStore,
} from "../../src/talent-management/training-development/data/hr.talent.training-store.shared";
import { buildHrTrainingListSurface } from "../../src/talent-management/training-development/surface/hr.talent.training-lists.surface";
import {
  hrTrainingCoursesSurfaceKey,
  hrTrainingReportsSurfaceKey,
  HR_TRAINING_LIST_SURFACE_KEYS,
} from "../../src/talent-management/training-development/surface/hr.talent.training-surface-metadata.shared";

describe("training development list EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrTrainingListSurface({
      surfaceKey: hrTrainingCoursesSurfaceKey,
      searchValue: "safe",
      rows: [
        {
          id: "course-safety-101",
          cells: {
            code: "SAFE-101",
            title: "Workplace Safety Fundamentals",
            trainingType: "Safety Training",
            deliveryMode: "In Person",
            capacity: 2,
            cost: "MYR 450",
            status: "Active",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrTalentTrainingReadPermission);
    expect(surface.presentation!.toolbar?.search?.value).toBe("safe");
    expect(surface.surface.columnsId).toBe(hrTrainingCoursesSurfaceKey);
    expect(surface.pagination!.totalCount).toBe(1);
  });

  it("builds a page model with reporting and gated integration sections", async () => {
    resetHrTrainingStore("org-trn-eui");

    const pageModel = await buildHrTrainingPageModel({
      organizationId: "org-trn-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "provider",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrTrainingReportsSurfaceKey,
    );
    expect(pageModel.sections).toHaveLength(HR_TRAINING_LIST_SURFACE_KEYS.length);
  });

  it("exposes blended LMS completion references for compliance", () => {
    const store = getHrTrainingStore("org-trn-eui");
    const refs = listHrTrainingComplianceCompletionRefs(store);

    expect(refs.some((ref) => ref.sourceSystem === "blended")).toBe(true);
    expect(refs.every((ref) => ref.requirementRef.length > 0)).toBe(true);
  });
});
