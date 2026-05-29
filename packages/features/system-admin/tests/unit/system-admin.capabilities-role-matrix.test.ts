import { describe, expect, it, vi } from "vitest";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import { buildSystemAdminCapabilityRoleMatrix } from "../../src/capabilities/data/system-admin.capabilities-role-matrix.server";

vi.mock(
  "../../src/users/data/system-admin.identity.repository.server",
  () => ({
    listRoleOverridesForOrganization: vi.fn(async () => []),
  }),
);

describe("system admin capability role matrix", () => {
  it("loads matrix rows for owner filter", async () => {
    const rows = await buildSystemAdminCapabilityRoleMatrix({
      organizationId: "org_1",
      moduleSettings: [],
      capabilitySettings: [],
      roleFilter: "owner",
    });

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.role).toBe("owner");
    expect(rows.some((row) => row.access === "granted")).toBe(true);
  });

  it("marks blocked access when org capability availability is disabled", async () => {
    const capabilityKey =
      listExecutionCapabilities()[0]?.key ?? "system-admin.view";

    const rows = await buildSystemAdminCapabilityRoleMatrix({
      organizationId: "org_1",
      moduleSettings: [],
      capabilitySettings: [
        {
          organizationId: "org_1",
          capabilityKey,
          availability: "disabled",
        },
      ],
      roleFilter: "owner",
    });

    const target = rows.find((row) => row.capabilityKey === capabilityKey);
    expect(target?.access).toBe("blocked");
  });
});
