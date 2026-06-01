import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import { buildApprovalsListSurface } from "../../src/approvals/surface/system-admin.approvals-list.surface";
import { systemAdminApprovalsGalleryRows } from "../../src/approvals/surface/system-admin.approvals-gallery.fixtures.shared";

describe("system admin approvals list surface gallery", () => {
  it.each([
    [
      "approvals — ready",
      buildApprovalsListSurface({
        approvals: systemAdminApprovalsGalleryRows,
        canMutate: true,
      }),
    ],
    [
      "approvals — read only",
      buildApprovalsListSurface({
        approvals: systemAdminApprovalsGalleryRows,
        canMutate: false,
      }),
    ],
    [
      "approvals — empty",
      buildApprovalsListSurface({ approvals: [], canMutate: true }),
    ],
  ])("parses list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("serializes trailing action metadata for active approval rows", () => {
    const surface = buildApprovalsListSurface({
      approvals: systemAdminApprovalsGalleryRows,
      canMutate: true,
    });

    const activeRow = surface.rows.find(
      (row) => row.id === "purchasing.po.approval",
    );
    expect(activeRow?.trailingAction?.state).toBe("ready");
    expect(activeRow?.cells.escalation).toContain("notify");
  });

  it("disables trailing actions when manage capability is absent", () => {
    const surface = buildApprovalsListSurface({
      approvals: systemAdminApprovalsGalleryRows,
      canMutate: false,
    });

    const activeRow = surface.rows.find(
      (row) => row.id === "purchasing.po.approval",
    );
    expect(activeRow?.trailingAction?.state).toBe("disabled");
  });

  it("uses read-only empty copy when manage capability is absent", () => {
    const surface = buildApprovalsListSurface({
      approvals: [],
      canMutate: false,
    });

    expect(surface.surface.empty?.description).toContain(
      "system-admin.approvals.manage",
    );
    expect(surface.surface.empty?.description).not.toContain("editor below");
  });
});
