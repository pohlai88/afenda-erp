import { describe, expect, it } from "vitest";
import {
  assertTenantPathnameForOrganization,
  formatObjectStorageProviderLabel,
  parseBlobToR2MigrationArgs,
} from "../scripts/blob-to-r2-migration.shared";

describe("blob-to-r2 migration helpers", () => {
  it("parses migration CLI flags", () => {
    expect(
      parseBlobToR2MigrationArgs([
        "--organization-id",
        "org_a",
        "--dry-run",
        "--limit",
        "25",
        "--set-org-provider",
      ]),
    ).toEqual({
      organizationId: "org_a",
      dryRun: true,
      limit: 25,
      overwrite: false,
      setOrgProvider: true,
    });
  });

  it("rejects pathnames outside the tenant prefix", () => {
    expect(() =>
      assertTenantPathnameForOrganization({
        organizationId: "org_a",
        pathname: "tenants/org_b/finance/file.pdf",
      }),
    ).toThrow(/outside tenants\/org_a\//);
  });

  it("formats provider labels for operator output", () => {
    expect(formatObjectStorageProviderLabel(null)).toBe("Deployment default");
    expect(formatObjectStorageProviderLabel("r2")).toBe("Cloudflare R2");
  });
});
