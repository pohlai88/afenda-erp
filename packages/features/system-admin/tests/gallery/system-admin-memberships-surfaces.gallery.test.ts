import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import { buildMembersListSurface } from "../../src/features/memberships/sys-memberships-list.surface";
import { systemAdminMembershipsGalleryRows } from "../../src/features/memberships/sys-memberships-gallery.fixtures.shared";

describe("system admin memberships list surface gallery", () => {
  it.each([
    [
      "memberships — ready",
      buildMembersListSurface({
        memberships: systemAdminMembershipsGalleryRows,
        canMutate: true,
      }),
    ],
    [
      "memberships — read only",
      buildMembersListSurface({
        memberships: systemAdminMembershipsGalleryRows,
        canMutate: false,
      }),
    ],
    [
      "memberships — empty",
      buildMembersListSurface({ memberships: [], canMutate: true }),
    ],
  ])("parses list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("serializes trailing action metadata for active membership rows", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows,
      canMutate: true,
    });

    const activeRow = surface.rows.find((row) => row.id === "member-gallery-1");
    expect(activeRow?.trailingAction?.state).toBe("ready");
    expect(activeRow?.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "positive",
    });
  });

  it("hides trailing actions for removed memberships", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows,
      canMutate: true,
    });

    const removedRow = surface.rows.find((row) => row.id === "member-gallery-3");
    expect(removedRow?.trailingAction?.state).toBe("hidden");
  });

  it("disables trailing actions when no manage capabilities are present", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows,
      canMutate: false,
      canManageRoles: false,
    });

    const activeRow = surface.rows.find((row) => row.id === "member-gallery-1");
    expect(activeRow?.trailingAction?.state).toBe("hidden");
  });

  it("keeps trailing actions ready for roles-only administrators", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows,
      canMutate: false,
      canManageRoles: true,
    });

    const activeRow = surface.rows.find((row) => row.id === "member-gallery-1");
    expect(activeRow?.trailingAction?.state).toBe("ready");
    expect(activeRow?.cells.canManageRoles).toBe("true");
    expect(activeRow?.cells.canMutateMemberships).toBe("false");
  });
});
