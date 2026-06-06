import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createMetadataUiSectionFixtureSet } from "./fixture-builders.shared";
import {
  createMetadataUiCertificationBlockers,
  createMetadataUiCertificationEvidenceGate,
  createMetadataUiVisualCertificationPlan,
  type MetadataUiCertificationEvidence,
  type MetadataUiCertificationCheck,
} from "./visual-accessibility-certification.shared";

const PACKAGE_ROOT = process.cwd();
const SRC_ROOT = path.join(PACKAGE_ROOT, "src");

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("metadata-ui visual and accessibility certification", () => {
  it("defines certification coverage for every production surface fixture", () => {
    const fixtures = createMetadataUiSectionFixtureSet();
    const plans = createMetadataUiVisualCertificationPlan();
    const fixtureKeys = new Set([
      fixtures.actionBar.key,
      fixtures.auditPanel.key,
      fixtures.chart.key,
      fixtures.detailTabs.key,
      fixtures.form.key,
      fixtures.kanban.key,
      fixtures.list.key,
      fixtures.pageHeader.key,
      fixtures.stat.key,
    ]);

    expect(plans).toHaveLength(9);
    expect(plans.map((plan) => plan.fixtureKey).sort()).toEqual(
      [...fixtureKeys].sort(),
    );
    expect(createMetadataUiCertificationBlockers(plans)).toEqual([]);
  });

  it("keeps certification fixtures deterministic and nonblank", () => {
    const fixtures = createMetadataUiSectionFixtureSet();

    expect(fixtures.list.columns.length).toBeGreaterThan(0);
    expect(fixtures.stat.items.length).toBeGreaterThan(0);
    expect(fixtures.actionBar.actions.length).toBeGreaterThan(0);
    expect(fixtures.pageHeader.title).toBeTruthy();
    expect(fixtures.form.sections[0]?.fields.length).toBeGreaterThan(0);
    expect(fixtures.detailTabs.tabs.length).toBeGreaterThan(0);
    expect(fixtures.chart.data.length).toBeGreaterThan(0);
    expect(fixtures.chart.series.length).toBeGreaterThan(0);
    expect(fixtures.kanban.cards.length).toBeGreaterThan(0);
    expect(fixtures.auditPanel.title).toBeTruthy();
  });

  it("keeps visual evidence paths under the approved artifact root", () => {
    const plans = createMetadataUiVisualCertificationPlan();

    for (const plan of plans) {
      expect(plan.artifactDirectory).toMatch(/^\.artifacts\/metadata-ui\/e10\//);
      expect(plan.screenshots.desktop).toBe(`${plan.artifactDirectory}/1440x900.png`);
      expect(plan.screenshots.mobile).toBe(`${plan.artifactDirectory}/390x844.png`);
      expect(plan.requiredChecks).toEqual(
        expect.arrayContaining([
          "desktop-screenshot",
          "mobile-screenshot",
          "no-blank-render",
          "no-text-overlap",
          "artifact-hygiene",
        ] satisfies MetadataUiCertificationCheck[]),
      );
    }
  });

  it("requires interaction and reduced-motion checks where the renderer needs them", () => {
    const plans = createMetadataUiVisualCertificationPlan();
    const bySurface = new Map(plans.map((plan) => [plan.surface, plan]));

    expect(bySurface.get("list")?.requiredChecks).toEqual(
      expect.arrayContaining(["keyboard-navigation", "current-server-window"]),
    );
    expect(bySurface.get("form")?.requiredChecks).toContain("keyboard-navigation");
    expect(bySurface.get("chart")?.requiredChecks).toEqual(
      expect.arrayContaining(["reduced-motion", "table-fallback"]),
    );
    expect(bySurface.get("kanban")?.requiredChecks).toContain("reduced-motion");
    expect(bySurface.get("stat")?.requiredChecks).toContain("reduced-motion");
  });

  it("blocks replacement until screenshot and accessibility evidence is complete", () => {
    const plans = createMetadataUiVisualCertificationPlan();
    const blocked = createMetadataUiCertificationEvidenceGate({
      plans,
      evidence: [],
    });
    const completeEvidence: MetadataUiCertificationEvidence[] = plans.map((plan) => ({
      surface: plan.surface,
      capturedAt: "2026-06-04T00:00:00.000Z",
      screenshots: plan.screenshots,
      completedChecks: plan.requiredChecks,
      reviewer: "metadata-ui-certification",
    }));
    const planningOnlyAllowed = createMetadataUiCertificationEvidenceGate({
      plans,
      evidence: completeEvidence,
      requireArtifactFiles: false,
    });
    const firstPlan = plans[0];
    const firstEvidence = completeEvidence[0];
    if (!firstPlan || !firstEvidence) {
      throw new Error("Expected at least one metadata-ui certification plan.");
    }
    const blockedByMissingFiles = createMetadataUiCertificationEvidenceGate({
      plans: [firstPlan],
      evidence: [firstEvidence],
    });

    expect(blocked.canReplace).toBe(false);
    expect(blocked.blockers).toContain("list:missing-evidence");
    expect(blocked.requiredEvidence).toContain(
      "artifacts stored under .artifacts/metadata-ui/e10/",
    );
    expect(planningOnlyAllowed.canReplace).toBe(true);
    expect(planningOnlyAllowed.blockers).toEqual([]);
    expect(blockedByMissingFiles.blockers).toEqual(
      expect.arrayContaining([
        `${firstPlan.surface}:desktop-screenshot-file`,
        `${firstPlan.surface}:mobile-screenshot-file`,
      ]),
    );
  });

  it("rejects stale or mismatched certification artifacts", () => {
    const [plan] = createMetadataUiVisualCertificationPlan();
    if (!plan) {
      throw new Error("Expected at least one metadata-ui certification plan.");
    }
    const gate = createMetadataUiCertificationEvidenceGate({
      plans: [plan],
      evidence: [
        {
          surface: plan.surface,
          capturedAt: "not-a-date",
          screenshots: {
            desktop: ".artifacts/wrong.png",
          },
          completedChecks: ["deterministic-fixture"],
        },
      ],
    });

    expect(gate.canReplace).toBe(false);
    expect(gate.blockers).toEqual(
      expect.arrayContaining([
        `${plan.surface}:desktop-screenshot-artifact`,
        `${plan.surface}:mobile-screenshot-artifact`,
        `${plan.surface}:captured-at`,
      ]),
    );
  });

  it("keeps certification planning shared-runtime and fixture-only", () => {
    const certificationSource = readSource(
      "tests/visual-accessibility-certification.shared.ts",
    );
    const fixtureSource = readSource("tests/fixture-builders.shared.ts");

    expect(certificationSource).not.toContain("@afenda/feature");
    expect(certificationSource).not.toContain("@afenda/governed-surface");
    expect(certificationSource).not.toContain("apps/erp");
    expect(certificationSource).not.toContain("fetch(");
    expect(certificationSource).not.toContain("localStorage");
    expect(certificationSource).not.toMatch(/^\s*<[A-Za-z]/m);
    expect(certificationSource).not.toMatch(/from "react"|from 'react'/);
    expect(fixtureSource).not.toContain("@afenda/feature");
    expect(fixtureSource).not.toContain("@afenda/governed-surface");
  });

  it("anchors certification requirements to implemented renderer behavior", () => {
    const listTableSource = readSource("sections/list/list-table.client.tsx");
    const formRendererSource = readSource("sections/form/form-renderer.server.tsx");
    const fieldSource = readSource("primitives/field.server.tsx");
    const chartSource = readSource("sections/chart/chart-body.client.tsx");
    const kanbanSource = readSource("sections/kanban/kanban-drag-board.client.tsx");
    const auditPanelSource = readSource("sections/audit-panel/audit-panel-renderer.server.tsx");
    const timelineSource = readSource("primitives/timeline.server.tsx");
    const statSource = readSource("primitives/stat-value.client.tsx");

    expect(listTableSource).toContain('data-metadata-ui-server-window="current"');
    expect(listTableSource).toContain("aria-label={`Sort by");
    expect(listTableSource).toContain("aria-label={`Select row");
    expect(formRendererSource).toContain("aria-live=\"polite\"");
    expect(fieldSource).toContain("aria-invalid");
    expect(chartSource).toContain("data-metadata-ui-reduced-motion");
    expect(chartSource).toContain("<table>");
    expect(kanbanSource).toContain("useReducedMotion");
    expect(kanbanSource).toContain("data-metadata-ui-move-intent");
    expect(kanbanSource).toContain('aria-live="polite"');
    expect(kanbanSource).toContain("data-metadata-ui-kanban-dragging");
    expect(auditPanelSource).toContain('role="list"');
    expect(auditPanelSource).toContain("data-metadata-ui-audit-event-count");
    expect(auditPanelSource).toContain('role="listitem"');
    expect(timelineSource).toContain('role="list"');
    expect(timelineSource).toContain("data-metadata-ui-timeline-step-count");
    expect(timelineSource).toContain("data-metadata-ui-timeline-current-step-key");
    expect(timelineSource).toContain('role="listitem"');
    expect(statSource).toContain("useCanAnimate");
  });

  it("keeps metadata header spacing tokens attached to real layout containers", () => {
    const pageHeaderSource = readSource("primitives/page-header.server.tsx");
    const surfaceChromeSource = readSource("primitives/surface-chrome.server.tsx");
    const pageHeaderSectionSource = readSource(
      "sections/page-header/page-header-renderer.server.tsx",
    );
    const headingSource = readSource("shell/heading.server.tsx");
    const sectionShellSource = readSource("shell/section-shell.server.tsx");

    expect(pageHeaderSource).toContain(
      'className={cn("metadata-ui-page-header grid", ui.surfaceGap.md, className)}',
    );
    expect(pageHeaderSource).toContain(
      'role={resolvedHeader.level === "workspace" ? "banner" : undefined}',
    );
    expect(pageHeaderSource).toContain("data-metadata-ui-page-header-primary-actions");
    expect(pageHeaderSource).toContain("data-metadata-ui-page-header-overflow-actions");
    expect(surfaceChromeSource).toContain('role="region"');
    expect(surfaceChromeSource).toContain("data-metadata-ui-surface-region-count");
    expect(surfaceChromeSource).toContain("aria-describedby={summaryId}");
    expect(pageHeaderSectionSource).toContain(
      "MetadataUiPrimitivePageHeader",
    );
    expect(headingSource).toContain(
      '"metadata-ui-heading flex min-w-0 items-start justify-between"',
    );
    expect(headingSource).toContain('className={cn("grid min-w-0", ui.surfaceGap.xs)}');
    expect(sectionShellSource).toContain(
      'className={cn("metadata-ui-section-shell grid", ui.surfaceGap.md)}',
    );
  });

  it("keeps list controls on shadcn primitives instead of native form chrome", () => {
    const listToolbarSource = readSource("sections/list/list-toolbar.client.tsx");
    const listTableSource = readSource("sections/list/list-table.client.tsx");
    const actionBarSource = readSource(
      "sections/action-bar/action-bar-renderer.server.tsx",
    );

    expect(listToolbarSource).not.toContain("NativeSelect");
    expect(listToolbarSource).toContain("SelectTrigger");
    expect(listToolbarSource).toContain("SelectContent");
    expect(listTableSource).toContain("TableHead");
    expect(listTableSource).toContain("TableCell");
    expect(actionBarSource).toContain("DropdownMenuGroup");
    expect(actionBarSource).toContain("rounded-section border border-border/70 bg-card");
    expect(actionBarSource).toContain('role="toolbar"');
    expect(actionBarSource).toContain("data-metadata-ui-action-bar-main-count");
    expect(listToolbarSource).toContain('role="toolbar"');
    expect(listToolbarSource).toContain('aria-live="polite"');
    expect(listToolbarSource).toContain("data-metadata-ui-list-toolbar-summary");
  });

  it("keeps metadata error and fallback surfaces on shadcn/token contracts", () => {
    const formRendererSource = readSource("sections/form/form-renderer.server.tsx");
    const multiStepFormRendererSource = readSource(
      "sections/multi-step-form/multi-step-form-renderer.server.tsx",
    );
    const scorecardFormRendererSource = readSource(
      "sections/scorecard-form/scorecard-form-renderer.server.tsx",
    );
    const chartBodySource = readSource("sections/chart/chart-body.client.tsx");
    const metricCardSource = readSource("primitives/metric-card.server.tsx");
    const emptyStateSource = readSource("primitives/empty.server.tsx");

    for (const source of [
      formRendererSource,
      multiStepFormRendererSource,
      scorecardFormRendererSource,
    ]) {
      expect(source).toContain("AlertTitle");
      expect(source).toContain("AlertDescription");
      expect(source).not.toMatch(/\b(?:border|bg|text)-red-\d{2,3}\b/);
      expect(source).not.toContain("rounded-md");
    }

    expect(scorecardFormRendererSource).toContain("RadioGroup");
    expect(scorecardFormRendererSource).toContain("RadioGroupItem");
    expect(scorecardFormRendererSource).not.toMatch(/<input\b/);
    expect(scorecardFormRendererSource).toContain(
      "data-metadata-ui-scorecard-criterion-count",
    );
    expect(scorecardFormRendererSource).toContain(
      "data-metadata-ui-scorecard-error-count",
    );
    expect(scorecardFormRendererSource).toContain('role="list"');
    expect(scorecardFormRendererSource).toContain('role="listitem"');
    expect(chartBodySource).toContain("ui.radius.control");
    expect(chartBodySource).toContain("ui.typography.body");
    expect(chartBodySource).not.toContain('className="rounded border px-3 py-2 text-sm"');
    expect(metricCardSource).toContain('role="group"');
    expect(metricCardSource).toContain("data-metadata-ui-metric-card");
    expect(metricCardSource).toContain("data-metadata-ui-metric-progress");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-kind");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-tone");
    expect(emptyStateSource).toContain("data-metadata-ui-empty-alert");
  });
});
