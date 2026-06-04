import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import { buildUsersListSurface } from "../../src/features/users/sys-users-list.surface";
import { systemAdminUsersGalleryRows } from "../../src/features/users/sys-users-gallery.fixtures.shared";

describe("system admin users list surface gallery", () => {
  it.each([
    [
      "users — ready",
      buildUsersListSurface({
        users: systemAdminUsersGalleryRows,
        canMutate: true,
      }),
    ],
    [
      "users — read only",
      buildUsersListSurface({
        users: systemAdminUsersGalleryRows,
        canMutate: false,
      }),
    ],
    ["users — empty", buildUsersListSurface({ users: [], canMutate: true })],
  ])("parses list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("serializes trailing action metadata for lifecycle rows", () => {
    const surface = buildUsersListSurface({
      users: systemAdminUsersGalleryRows,
      canMutate: true,
    });

    const activeRow = surface.rows.find((row) => row.id === "member-gallery-1");
    expect(activeRow?.trailingAction?.state).toBe("ready");
    expect(activeRow?.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "positive",
    });
  });

  it("disables trailing actions when manage capability is absent", () => {
    const surface = buildUsersListSurface({
      users: systemAdminUsersGalleryRows,
      canMutate: false,
    });

    const activeRow = surface.rows.find((row) => row.id === "member-gallery-1");
    expect(activeRow?.trailingAction?.state).toBe("disabled");
    expect(activeRow?.trailingAction?.disabledReason).toContain(
      "system-admin.users.manage",
    );
  });

  it("hides trailing actions for removed users in gallery fixtures", () => {
    const surface = buildUsersListSurface({
      users: systemAdminUsersGalleryRows,
      canMutate: true,
    });

    const removedRow = surface.rows.find((row) => row.id === "member-gallery-3");
    expect(removedRow?.trailingAction?.state).toBe("hidden");
  });
});
