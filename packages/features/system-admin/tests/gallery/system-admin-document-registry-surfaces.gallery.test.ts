import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { buildDocumentRegistryListSurface } from "@afenda/kernel";
import { describe, expect, it } from "vitest";

import {
  systemAdminDocumentRegistryGalleryModuleId,
  systemAdminDocumentRegistryGalleryRows,
  systemAdminDocumentRegistrySensitiveGalleryModuleId,
} from "../../src/tenant-execution/metadata";

describe("system admin document registry gallery surfaces", () => {
  it("parses registry fixture rows including pending scan and sensitive cases", () => {
    const surface = buildDocumentRegistryListSurface({
      moduleId: systemAdminDocumentRegistryGalleryModuleId,
      documents: systemAdminDocumentRegistryGalleryRows.slice(0, 4),
      canWrite: true,
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.rows).toHaveLength(4);
    expect(surface.requiresErpPermission).toEqual({
      module: systemAdminDocumentRegistryGalleryModuleId,
      object: "documents",
      function: "read",
    });
  });

  it("masks sensitive classification when canViewSensitive is false", () => {
    const sensitiveRow = systemAdminDocumentRegistryGalleryRows[4]!;
    const surface = buildDocumentRegistryListSurface({
      moduleId: systemAdminDocumentRegistrySensitiveGalleryModuleId,
      documents: [sensitiveRow],
      canViewSensitive: false,
    });

    const row = surface.rows[0];
    expect(row?.cells.classificationValue).not.toBe("restricted");
  });

  it("serializes document lifecycle trailing actions for quarantined rows", () => {
    const quarantinedRow = systemAdminDocumentRegistryGalleryRows[2]!;
    const surface = buildDocumentRegistryListSurface({
      moduleId: systemAdminDocumentRegistryGalleryModuleId,
      documents: [quarantinedRow],
      canWrite: true,
    });

    const row = surface.rows[0];
    expect(row?.cells.scanStatusValue).toBe("quarantined");
    expect(row?.trailingAction?.descriptor?.id).toBe("document-lifecycle");
  });

  it("renders empty registry copy", () => {
    const surface = buildDocumentRegistryListSurface({
      moduleId: systemAdminDocumentRegistryGalleryModuleId,
      documents: [],
    });

    expect(surface.rows).toHaveLength(0);
    expect(surface.surface.empty?.title).toBeTruthy();
  });
});
