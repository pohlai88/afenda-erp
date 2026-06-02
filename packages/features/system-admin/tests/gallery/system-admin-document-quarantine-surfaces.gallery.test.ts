import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import {
  buildSystemAdminDocumentQuarantineInboxListSurface,
  systemAdminDocumentQuarantineInboxGalleryRows,
} from "../../src/tenant-execution/metadata";

describe("system admin document quarantine inbox gallery surfaces", () => {
  it("parses quarantine inbox fixture rows", () => {
    const surface = buildSystemAdminDocumentQuarantineInboxListSurface({
      documents: systemAdminDocumentQuarantineInboxGalleryRows,
      window: {
        pageSize: 25,
        totalCount: systemAdminDocumentQuarantineInboxGalleryRows.length,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.rows).toHaveLength(2);
    expect(surface.requiresErpPermission).toEqual({
      module: "system-admin",
      object: "documents",
      function: "read",
    });
  });

  it("renders empty quarantine inbox copy", () => {
    const surface = buildSystemAdminDocumentQuarantineInboxListSurface({
      documents: [],
      window: {
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
    });

    expect(surface.rows).toHaveLength(0);
    expect(surface.surface.empty?.title).toBe("No quarantined documents.");
  });

  it("serializes scan quarantine trailing actions", () => {
    const surface = buildSystemAdminDocumentQuarantineInboxListSurface({
      documents: [systemAdminDocumentQuarantineInboxGalleryRows[0]!],
      canWrite: true,
    });

    const row = surface.rows[0];
    expect(row?.cells.scanStatusValue).toBe("quarantined");
    expect(row?.cells.moduleIdValue).toBe("finance");
    expect(row?.trailingAction?.descriptor?.label).toBe("Review scan");
  });
});
