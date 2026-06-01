import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { __IDENTIFIER_CAMEL__ReadPermission } from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/contracts/__DOMAIN_KEY__.contract";
import { build__IDENTIFIER__PageModel } from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/data/__DOMAIN_KEY__.page-model.server";
import { reset__IDENTIFIER__Store } from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/data/__DOMAIN_KEY__-store.shared";
import { build__IDENTIFIER__ListSurface } from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/surface/__DOMAIN_KEY__-lists.surface";
import {
  __CONSTANT_PREFIX___LIST_SURFACE_KEYS,
  __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
  __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
} from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/surface/__DOMAIN_KEY__-surface-metadata.shared";

describe("__CAPABILITY_TITLE__ list EUI contract", () => {
  it("builds a governed Pattern C server-window list configuration", () => {
    const listSurface = build__IDENTIFIER__ListSurface({
      surfaceKey: __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
      searchValue: "readiness",
      rows: [
        {
          id: "__DOMAIN_LAST__-record-1",
          rowTone: "attention",
          cells: {
            name: "__CAPABILITY_TITLE__ readiness record",
            owner: "HR Operations",
            updatedAt: "2026-06-01",
            status: "Draft",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(listSurface).success).toBe(
      true,
    );
    expect(listSurface.requiresErpPermission).toEqual(
      __IDENTIFIER_CAMEL__ReadPermission,
    );
    expect(listSurface.surface.columnsId).toBe(
      __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
    );
    expect(listSurface.presentation?.toolbar?.search?.value).toBe("readiness");
    expect(listSurface.pagination?.totalCount).toBe(1);
  });

  it("builds a page model with KPI, workbench, and gated audit sections", async () => {
    reset__IDENTIFIER__Store("org-__DOMAIN_LAST__-scaffold");

    const pageModel = await build__IDENTIFIER__PageModel({
      organizationId: "org-__DOMAIN_LAST__-scaffold",
      canReadAudit: true,
      reportGroupBy: "status",
      status: "all",
    });

    expect(pageModel.overview.stats).toHaveLength(3);
    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual(
      __CONSTANT_PREFIX___LIST_SURFACE_KEYS,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
    );
  });

  it("hides audit section when audit access is not granted", async () => {
    reset__IDENTIFIER__Store("org-__DOMAIN_LAST__-no-audit");

    const pageModel = await build__IDENTIFIER__PageModel({
      organizationId: "org-__DOMAIN_LAST__-no-audit",
      canReadAudit: false,
      reportGroupBy: "status",
      status: "all",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual([
      __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
    ]);
  });
});
