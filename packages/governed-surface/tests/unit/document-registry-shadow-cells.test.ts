import { buildDocumentRegistryListSurface } from "@afenda/kernel";
import { describe, expect, it } from "vitest";

import { parseListSurfaceRendererConfiguration } from "../../src/schemas/list-surface-renderer.schema";

describe("document registry shadow cells contract", () => {
  it("parses rows with scanStatusValue and retentionClassValue for document-lifecycle trailing", () => {
    const surface = buildDocumentRegistryListSurface({
      documents: [
        {
          id: "d1",
          title: "Invoice Q1",
          contentType: "PDF",
          size: "120 KB",
          access: "private",
          classification: "internal",
          retentionClass: "standard",
          scanStatus: "passed",
          createdAt: "2026-06-02T10:00:00.000Z",
        },
      ],
      moduleId: "finance",
      canWrite: true,
    });

    const result = parseListSurfaceRendererConfiguration(surface);
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const row = result.data.rows[0];
    expect(row?.cells.scanStatusValue).toBe("passed");
    expect(row?.cells.retentionClassValue).toBe("standard");
    expect(row?.trailingAction?.descriptor?.id).toBe("document-lifecycle");
  });

  it("rejects document-lifecycle trailing rows missing shadow cells", () => {
    const surface = buildDocumentRegistryListSurface({
      documents: [
        {
          id: "d1",
          title: "Invoice Q1",
          contentType: "PDF",
          size: "120 KB",
          access: "private",
          classification: "internal",
          retentionClass: "standard",
          scanStatus: "passed",
          createdAt: "2026-06-02T10:00:00.000Z",
        },
      ],
      moduleId: "finance",
      canWrite: true,
    });

    const row = surface.rows[0];
    if (!row) {
      throw new Error("expected row");
    }

    const { scanStatusValue: _scan, retentionClassValue: _retention, ...cells } =
      row.cells;

    const invalid = {
      ...surface,
      rows: [
        {
          ...row,
          cells,
        },
      ],
    };

    const result = parseListSurfaceRendererConfiguration(invalid);
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages.some((message) => message.includes("scanStatusValue"))).toBe(
      true,
    );
    expect(
      messages.some((message) => message.includes("retentionClassValue")),
    ).toBe(true);
  });

  it("does not require shadow cells when document-lifecycle trailing is hidden", () => {
    const surface = buildDocumentRegistryListSurface({
      documents: [
        {
          id: "d1",
          title: "Invoice Q1",
          contentType: "PDF",
          size: "120 KB",
          access: "private",
          classification: "internal",
          retentionClass: "standard",
          scanStatus: "passed",
          createdAt: "2026-06-02T10:00:00.000Z",
        },
      ],
      moduleId: "finance",
      canWrite: false,
    });

    const row = surface.rows[0];
    if (!row) {
      throw new Error("expected row");
    }

    const { scanStatusValue: _scan, retentionClassValue: _retention, ...cells } =
      row.cells;

    const withoutShadowCells = {
      ...surface,
      rows: [
        {
          ...row,
          cells,
          trailingAction: { state: "hidden" as const },
        },
      ],
    };

    expect(parseListSurfaceRendererConfiguration(withoutShadowCells).success).toBe(
      true,
    );
  });
});
