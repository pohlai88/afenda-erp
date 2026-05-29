import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedStatGrid,
} from "@afenda/governed-surface";
import { governedRendererCopy } from "../../src/i18n/governed-renderer-copy.shared";
import { StatCardRenderer } from "../../src/metadata/renderers/stat-card.renderer";
import { ApprovalTimelineRenderer } from "../../src/metadata/renderers/approval-timeline.renderer";
import { EmptyRenderer } from "../../src/metadata/renderers/empty.renderer";

describe("StatCardRenderer empty state", () => {
  it("renders GovernedEmpty when stats array is empty", () => {
    const configuration = buildGovernedStatGrid({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "kpi",
      presentationProfile: "erp-kpi-grid",
      stats: [],
    });

    const html = renderToStaticMarkup(
      <StatCardRenderer configuration={configuration} />,
    );

    expect(html).toContain(governedRendererCopy.empty.statCard.title);
    expect(html).toContain(governedRendererCopy.empty.statCard.description);
  });
});

describe("ApprovalTimelineRenderer empty state", () => {
  it("renders GovernedEmpty when steps array is empty", () => {
    const html = renderToStaticMarkup(
      <ApprovalTimelineRenderer
        configuration={{
          dataNature: "approval-flow",
          title: "Approval flow",
          steps: [],
        }}
      />,
    );

    expect(html).toContain(governedRendererCopy.empty.approvalTimeline.title);
    expect(html).toContain(
      governedRendererCopy.empty.approvalTimeline.description,
    );
  });
});

describe("list-surface-table sort control composition", () => {
  it("uses Button with aria-sort and no raw button for column sort", () => {
    const repoRoot = join(fileURLToPath(import.meta.url), "..", "..", "..");
    const source = readFileSync(
      join(
        repoRoot,
        "src/metadata/renderers/list-surface-table.client.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("aria-sort");
    expect(source).toContain('aria-label={tableLabel ?? "Data table"}');
    expect(source).not.toMatch(/<button\b/);
    expect(source).toMatch(/variant="ghost"/);
  });
});

describe("EmptyRenderer parse failure", () => {
  it("renders GovernedEmpty instead of null when configuration is invalid", () => {
    const html = renderToStaticMarkup(
      <EmptyRenderer configuration={{ variant: "not-a-variant" }} />,
    );

    expect(html).toContain(governedRendererCopy.parseError.empty.userTitle);
    expect(html).toContain(governedRendererCopy.parseError.empty.userDescription);
  });
});
