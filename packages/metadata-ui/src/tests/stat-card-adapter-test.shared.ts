import { describe, expect, it } from "vitest";

import { adaptGovernedStatCardToMetadataUiStat } from "../migration/stat-card-migration.shared";
import { METADATA_UI_STAT_SCHEMA_ID } from "../schemas/stat.schema";

describe("governed stat migration adapter", () => {
  it("adapts governed stat-card config into metadata-ui stat metadata", () => {
    const result = adaptGovernedStatCardToMetadataUiStat({
      key: "finance.close-summary",
      title: "Close summary",
      dataNature: "kpi",
      density: "compact",
      presentationProfile: "erp-kpi-grid",
      stats: [
        {
          label: "Open tasks",
          value: "12",
          tone: "attention",
          delta: "+3",
          href: "/workspace/finance/tasks",
          icon: "alert",
          animateValue: false,
        },
        {
          label: "Completed",
          value: "84%",
          tone: "positive",
          comparison: {
            priorValue: "79%",
            label: "last period",
            direction: "up",
          },
        },
      ],
    });

    expect(result.stat.schemaId).toBe(METADATA_UI_STAT_SCHEMA_ID);
    expect(result.stat.key).toBe("finance.close-summary");
    expect(result.stat.layout).toBe("grid");
    expect(result.stat.dataNature).toBe("kpi");
    expect(result.stat.metadata).toMatchObject({
      migrationSource: "governed-surface.stat-card",
      governedDataNature: "kpi",
    });
    expect(result.stat.presentation?.chrome.density).toBe("compact");
    expect(result.stat.presentation?.metadata).toMatchObject({
      migrationSource: "governed-surface.stat-card",
      governedPresentationProfile: "erp-kpi-grid",
    });

    expect(result.stat.items[0]).toMatchObject({
      key: "governed.open-tasks.1",
      label: "Open tasks",
      value: "12",
      format: "custom",
      display: {
        animation: "off",
        iconKey: "alert",
      },
      tone: "warning",
      comparison: {
        label: "Delta",
        value: "+3",
        direction: "flat",
      },
      drilldown: {
        action: {
          execution: {
            kind: "navigation",
            href: "/workspace/finance/tasks",
          },
        },
      },
    });

    expect(result.stat.items[1]).toMatchObject({
      key: "governed.completed.2",
      tone: "positive",
      comparison: {
        label: "last period",
        value: "79%",
        direction: "up",
      },
    });

    expect(result.parityNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemKey: "governed.open-tasks.1",
          sourceField: "delta",
          disposition: "mapped-to-comparison",
        }),
        expect.objectContaining({
          itemKey: "governed.open-tasks.1",
          sourceField: "icon",
          disposition: "carried-as-metadata",
        }),
        expect.objectContaining({
          itemKey: "governed.open-tasks.1",
          sourceField: "animateValue",
          disposition: "carried-as-metadata",
        }),
      ]),
    );
  });

  it("uses row layout for snapshot summary or larger governed stat sets", () => {
    const result = adaptGovernedStatCardToMetadataUiStat({
      dataNature: "snapshot-summary",
      stats: [
        { label: "One", value: "1" },
        { label: "Two", value: "2" },
        { label: "Three", value: "3" },
        { label: "Four", value: "4" },
        { label: "Five", value: "5" },
      ],
    });

    expect(result.stat.layout).toBe("row");
    expect(result.stat.dataNature).toBe("snapshot-summary");
    expect(result.stat.items).toHaveLength(5);
    expect(result.parityNotes).toHaveLength(0);
  });

  it("carries governed progress and sparkline as explicit stat display metadata", () => {
    const result = adaptGovernedStatCardToMetadataUiStat({
      stats: [
        {
          label: "Exceptions",
          value: "7",
          progress: {
            value: 7,
            max: 10,
            label: "Exception threshold",
          },
          sparkPoints: [{ value: 1 }, { value: 7 }],
          animateValue: true,
        },
      ],
    });

    expect(result.stat.items[0]?.display).toMatchObject({
      animation: "respect-user",
      progress: {
        value: 7,
        max: 10,
        label: "Exception threshold",
      },
      sparkline: [{ value: 1 }, { value: 7 }],
    });
    expect(result.parityNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceField: "progress",
          disposition: "carried-as-metadata",
        }),
        expect.objectContaining({
          sourceField: "sparkPoints",
          disposition: "carried-as-metadata",
        }),
      ]),
    );
  });
});
