import { expect, type Locator, type Page, test } from "@playwright/test";

const PLAYGROUND_ROUTE = "/playground-metadataui";

const ADVANCED_NAVIGATION_COPY = [
  "Overview",
  "Operations",
  "Table Lab",
  "Records",
  "Forms",
  "Planning",
  "Analytics",
  "States",
] as const;

const ADVANCED_SCENARIO_KIND_COPY = [
  "overview",
  "operations-list",
  "tanstack-table",
  "record-detail",
  "workflow-form",
  "planning-board",
  "analytics",
  "state-matrix",
] as const;

type MetadataUiPlaygroundScenarioKind = (typeof ADVANCED_SCENARIO_KIND_COPY)[number];

const LEFT_NAVIGATION_LINK_CONTRACTS = [
  { label: "Overview", href: PLAYGROUND_ROUTE },
  { label: "Operations", href: `${PLAYGROUND_ROUTE}/operations-list` },
  { label: "Table Lab", href: `${PLAYGROUND_ROUTE}/tanstack-table` },
  { label: "Records", href: `${PLAYGROUND_ROUTE}/record-detail` },
  { label: "Forms", href: `${PLAYGROUND_ROUTE}/workflow-form` },
  { label: "Planning", href: `${PLAYGROUND_ROUTE}/planning-board` },
  { label: "Analytics", href: `${PLAYGROUND_ROUTE}/analytics` },
  { label: "States", href: `${PLAYGROUND_ROUTE}/state-matrix` },
] as const;

const ADVANCED_SECTION_CONTRACTS = [
  {
    scenarioKind: "overview",
    sectionId: "metadata-ui.playground.advanced.overview.stats",
    rendererId: "metadata-ui.renderer.stat",
    visibleCopy: ["Scenarios", "Nav groups", "Seeded"],
  },
  {
    scenarioKind: "overview",
    sectionId: "metadata-ui.playground.advanced.overview.chart",
    rendererId: "metadata-ui.renderer.chart",
    visibleCopy: ["Advanced seed distribution data"],
  },
  {
    scenarioKind: "overview",
    sectionId: "metadata-ui.playground.advanced.overview.list",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Scenario", "operations-list", "state-matrix"],
  },
  {
    scenarioKind: "operations-list",
    sectionId: "metadata-ui.playground.advanced.operations.action-bar",
    rendererId: "metadata-ui.renderer.action-bar",
    visibleCopy: ["Inspect queue", "Approve", "More commands"],
  },
  {
    scenarioKind: "operations-list",
    sectionId: "metadata-ui.playground.advanced.operations.list",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Sample Record A-100", "Command available", "Command disabled"],
  },
  {
    scenarioKind: "record-detail",
    sectionId: "metadata-ui.playground.advanced.record.detail-tabs",
    rendererId: "metadata-ui.renderer.detail-tabs",
    visibleCopy: ["Summary", "Audit", "Timeline"],
  },
  {
    scenarioKind: "record-detail",
    sectionId: "metadata-ui.playground.advanced.record.related-list",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Related operation", "Exception follow-up"],
  },
  {
    scenarioKind: "record-detail",
    sectionId: "metadata-ui.playground.advanced.record.audit-panel",
    rendererId: "metadata-ui.renderer.audit-panel",
    visibleCopy: ["Advanced record created", "Advanced record reviewed"],
  },
  {
    scenarioKind: "record-detail",
    sectionId: "metadata-ui.playground.advanced.record.timeline",
    rendererId: "metadata-ui.renderer.approval-timeline",
    visibleCopy: ["Advanced record prepared", "Advanced record review in progress"],
  },
  {
    scenarioKind: "workflow-form",
    sectionId: "metadata-ui.playground.advanced.workflow.multi-step",
    rendererId: "metadata-ui.renderer.multi-step-form",
    visibleCopy: ["Advanced workflow validation", "Review band", "Static reason"],
  },
  {
    scenarioKind: "workflow-form",
    sectionId: "metadata-ui.playground.advanced.workflow.scorecard",
    rendererId: "metadata-ui.renderer.scorecard-form",
    visibleCopy: ["Advanced workflow scorecard review", "Preparation complete"],
  },
  {
    scenarioKind: "planning-board",
    sectionId: "metadata-ui.playground.advanced.planning.board",
    rendererId: "metadata-ui.renderer.kanban",
    visibleCopy: ["Sample planning intake", "Sample capacity review"],
  },
  {
    scenarioKind: "planning-board",
    sectionId: "metadata-ui.playground.advanced.planning.timeline",
    rendererId: "metadata-ui.renderer.approval-timeline",
    visibleCopy: ["Planning intake normalized", "Capacity review in progress"],
  },
  {
    scenarioKind: "analytics",
    sectionId: "metadata-ui.playground.advanced.analytics.stats",
    rendererId: "metadata-ui.renderer.stat",
    visibleCopy: ["Signals", "Coverage", "Static"],
  },
  {
    scenarioKind: "analytics",
    sectionId: "metadata-ui.playground.advanced.analytics.chart",
    rendererId: "metadata-ui.renderer.chart",
    visibleCopy: ["Advanced analytics signal data"],
  },
  {
    scenarioKind: "analytics",
    sectionId: "metadata-ui.playground.advanced.analytics.list",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Cycle time", "Exception aging", "Review coverage"],
  },
  {
    scenarioKind: "tanstack-table",
    sectionId: "metadata-ui.playground.advanced.table-lab.list",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Window", "Selection", "Export current window"],
  },
  {
    scenarioKind: "state-matrix",
    sectionId: "metadata-ui.playground.state-coverage",
    rendererId: "metadata-ui.renderer.list",
    visibleCopy: ["Renderer state", "skeleton-contract", "Permission denied"],
  },
] as const;

const ADVANCED_PATTERN_SCREENSHOTS = [
  {
    scenarioKind: "overview",
    fileName: "metadata-ui-playground-overview-desktop.png",
  },
  {
    scenarioKind: "operations-list",
    fileName: "metadata-ui-playground-operations-list-desktop.png",
  },
  {
    scenarioKind: "tanstack-table",
    fileName: "metadata-ui-playground-tanstack-table-desktop.png",
  },
  {
    scenarioKind: "workflow-form",
    fileName: "metadata-ui-playground-workflow-form-desktop.png",
  },
  {
    scenarioKind: "state-matrix",
    fileName: "metadata-ui-playground-state-matrix-desktop.png",
  },
] as const satisfies readonly {
  scenarioKind: MetadataUiPlaygroundScenarioKind;
  fileName: string;
}[];

const BASELINE_RENDERER_COPY = [
  "Basic renderer gallery",
  "Inspect overview",
  "Refresh preview",
  "More",
  "Ready sections",
  "Sample rows",
  "Static fixtures",
  "Sample Record 001",
] as const;

function metadataSection(page: Page, sectionId: string): Locator {
  return page.locator(`[data-metadata-ui-section="${sectionId}"]`).first();
}

function metadataUiPlaygroundRouteForScenario(
  scenarioKind: MetadataUiPlaygroundScenarioKind,
): string {
  return scenarioKind === "overview"
    ? PLAYGROUND_ROUTE
    : `${PLAYGROUND_ROUTE}/${scenarioKind}`;
}

async function expectSectionContract(
  page: Page,
  contract: (typeof ADVANCED_SECTION_CONTRACTS)[number],
) {
  const section = metadataSection(page, contract.sectionId);

  await expect(section).toBeVisible();
  await expect(section).toHaveAttribute(
    "data-metadata-ui-renderer",
    contract.rendererId,
  );

  for (const copy of contract.visibleCopy) {
    await expect(section.getByText(copy, { exact: false }).first()).toBeVisible();
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  const horizontalOverflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth > documentElement.clientWidth + 1;
  });

  expect(horizontalOverflow).toBe(false);
}

async function expectMetadataUiTableScrollReachability(page: Page) {
  const containers = page.locator('[data-slot="table-container"]');
  const containerCount = await containers.count();

  for (let index = 0; index < containerCount; index += 1) {
    const container = containers.nth(index);
    const result = await container.evaluate((element) => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      element.scrollLeft = Math.max(0, maxScrollLeft);
      const reachedEnd = maxScrollLeft <= 1 || element.scrollLeft > 0;
      element.scrollLeft = 0;

      return {
        hasInternalOverflow: maxScrollLeft > 1,
        reachedEnd,
        visibleWidth: element.clientWidth,
        pageWidth: document.documentElement.clientWidth,
      };
    });

    expect(result.visibleWidth).toBeLessThanOrEqual(result.pageWidth);
    expect(result.reachedEnd).toBe(true);
  }
}

async function expectMetadataUiHeaderSpacing(page: Page) {
  const appHeader = metadataSection(page, "metadata-ui.playground.page-header");
  const patternHeader = metadataSection(
    page,
    "metadata-ui.playground.advanced.operations.header",
  );
  const actionBar = metadataSection(
    page,
    "metadata-ui.playground.advanced.operations.action-bar",
  );

  const [appHeaderBox, patternHeaderBox, actionBarBox] = await Promise.all([
    appHeader.boundingBox(),
    patternHeader.boundingBox(),
    actionBar.boundingBox(),
  ]);

  expect(appHeaderBox).not.toBeNull();
  expect(patternHeaderBox).not.toBeNull();
  expect(actionBarBox).not.toBeNull();

  if (!appHeaderBox || !patternHeaderBox || !actionBarBox) {
    return;
  }

  expect(patternHeaderBox.y - (appHeaderBox.y + appHeaderBox.height)).toBeGreaterThanOrEqual(
    12,
  );
  expect(actionBarBox.y - (patternHeaderBox.y + patternHeaderBox.height)).toBeGreaterThanOrEqual(
    12,
  );
  expect(appHeaderBox.x).toBeGreaterThanOrEqual(24);
  expect(patternHeaderBox.x).toBe(appHeaderBox.x);
}

test.describe("Metadata UI playground @visual", () => {
  test("renders routed advanced pattern surfaces without runtime errors", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(PLAYGROUND_ROUTE);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    await test.step("desktop advanced navigation is visible", async () => {
      await expect(
        page.getByRole("heading", { name: "Metadata UI Playground" }).first(),
      ).toBeVisible();

      const navigation = page.getByRole("complementary", {
        name: "Metadata UI playground navigation",
      });

      for (const copy of ADVANCED_NAVIGATION_COPY) {
        await expect(navigation.getByText(copy, { exact: false }).first()).toBeVisible();
      }

      for (const scenarioKind of ADVANCED_SCENARIO_KIND_COPY) {
        await expect(
          navigation
            .locator(`a[href="${metadataUiPlaygroundRouteForScenario(scenarioKind)}"]`)
            .first(),
        ).toBeVisible();
      }

      const renderedLinks = await navigation.locator("a[href]").evaluateAll(
        (anchors) =>
          anchors.map((anchor) => ({
            href: anchor.getAttribute("href") ?? "",
            label: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
          })),
      );

      const playgroundHrefs = new Set(
        renderedLinks
          .map((link) => link.href)
          .filter((href) => href.startsWith(PLAYGROUND_ROUTE)),
      );
      const playgroundLinks = renderedLinks.filter((link) =>
        link.href.startsWith(PLAYGROUND_ROUTE),
      );
      const expectedHrefs = new Set(
        LEFT_NAVIGATION_LINK_CONTRACTS.map((link) => link.href),
      );

      expect(playgroundHrefs).toEqual(expectedHrefs);
      expect(playgroundLinks).toHaveLength(LEFT_NAVIGATION_LINK_CONTRACTS.length);
      expect(playgroundHrefs.has(`${PLAYGROUND_ROUTE}/overview`)).toBe(false);

      for (const expectedLink of LEFT_NAVIGATION_LINK_CONTRACTS) {
        const matchingLinks = playgroundLinks.filter(
          (actualLink) =>
            actualLink.href === expectedLink.href &&
            actualLink.label.includes(expectedLink.label),
        );

        expect(matchingLinks).toHaveLength(1);
      }
    });

    await test.step("desktop left navigation links resolve to routed pages", async () => {
      const navigation = page.getByRole("complementary", {
        name: "Metadata UI playground navigation",
      });

      for (const expectedLink of LEFT_NAVIGATION_LINK_CONTRACTS) {
        await navigation.locator(`a[href="${expectedLink.href}"]`).first().click();
        await expect
          .poll(() => new URL(page.url()).pathname)
          .toBe(expectedLink.href);

        await expect(
          page.getByRole("heading", { name: "Metadata UI Playground" }).first(),
        ).toBeVisible();
      }
    });

    await test.step("desktop routed renderer sections are registered and populated", async () => {
      for (const scenarioKind of ADVANCED_SCENARIO_KIND_COPY) {
        await page.goto(metadataUiPlaygroundRouteForScenario(scenarioKind));
        await page.waitForLoadState("networkidle");

        for (const contract of ADVANCED_SECTION_CONTRACTS.filter(
          (candidate) => candidate.scenarioKind === scenarioKind,
        )) {
          await expectSectionContract(page, contract);
        }

        if (scenarioKind === "overview") {
          const scenarioIndex = metadataSection(
            page,
            "metadata-ui.playground.advanced.overview.list",
          );

          for (const scenarioKindCopy of ADVANCED_SCENARIO_KIND_COPY) {
            await expect(
              scenarioIndex.getByText(scenarioKindCopy, { exact: false }).first(),
            ).toBeVisible();
          }

          for (const copy of BASELINE_RENDERER_COPY) {
            await expect(page.getByText(copy, { exact: false }).first()).toBeVisible();
          }
        }

        if (scenarioKind === "operations-list") {
          await expectMetadataUiHeaderSpacing(page);
        }

        const screenshotContract = ADVANCED_PATTERN_SCREENSHOTS.find(
          (candidate) => candidate.scenarioKind === scenarioKind,
        );

        if (screenshotContract) {
          await expect(page).toHaveScreenshot(screenshotContract.fileName, {
            fullPage: true,
            animations: "disabled",
            caret: "initial",
          });
        }
      }
    });

    await test.step("desktop table controls expose keyboard and row-state metadata", async () => {
      await page.goto(metadataUiPlaygroundRouteForScenario("tanstack-table"));
      await page.waitForLoadState("networkidle");

      const tableLab = metadataSection(
        page,
        "metadata-ui.playground.advanced.table-lab.list",
      );
      const tableSearch = tableLab.getByPlaceholder("Search seeded table rows");

      await tableSearch.fill("approval 02");
      await expect(tableLab.getByText("Permission states")).toBeVisible();
      await expect(tableLab.getByText("Locked")).toBeVisible();
      await expect(
        tableLab.getByLabel(
          /Select row metadata-ui\.playground\.advanced\.seed\.table-row\.permission-disabled/,
        ),
      ).toBeDisabled();
      await expect(
        tableLab.locator('[data-metadata-ui-row-action-state="disabled"]').first(),
      ).toBeVisible();

      await tableSearch.fill("");
      await expect(
        tableLab.locator('[data-metadata-ui-row-action-state="available"]').first(),
      ).toBeVisible();
    });

    await test.step("desktop chart fallbacks and reduced-motion metadata are present", async () => {
      await page.goto(metadataUiPlaygroundRouteForScenario("analytics"));
      await page.waitForLoadState("networkidle");

      const analyticsChart = metadataSection(
        page,
        "metadata-ui.playground.advanced.analytics.chart",
      );

      await expect(
        analyticsChart.locator("[data-metadata-ui-reduced-motion]").first(),
      ).toHaveAttribute("data-metadata-ui-reduced-motion", /respect-user|always-static/);
      await expect(
        analyticsChart.getByText("Advanced analytics signal data", { exact: false }),
      ).toBeAttached();
    });

    await page.setViewportSize({ width: 390, height: 844 });

    await test.step("mobile routed surfaces remain reachable without page overflow", async () => {
      for (const scenarioKind of ADVANCED_SCENARIO_KIND_COPY) {
        await page.goto(metadataUiPlaygroundRouteForScenario(scenarioKind));
        await page.waitForLoadState("networkidle");

        await expect(
          page.getByRole("heading", { name: "Metadata UI Playground" }).first(),
        ).toBeVisible();

        for (const contract of ADVANCED_SECTION_CONTRACTS.filter(
          (candidate) => candidate.scenarioKind === scenarioKind,
        )) {
          await expect(metadataSection(page, contract.sectionId)).toBeVisible();
        }

        await expectNoHorizontalOverflow(page);
        await expectMetadataUiTableScrollReachability(page);
      }
    });

    await test.step("mobile screenshots gate table and state pattern pages", async () => {
      await page.goto(metadataUiPlaygroundRouteForScenario("tanstack-table"));
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("metadata-ui-playground-table-mobile.png", {
        fullPage: true,
        animations: "disabled",
        caret: "initial",
      });

      await page.goto(metadataUiPlaygroundRouteForScenario("state-matrix"));
      await page.waitForLoadState("networkidle");
      await expect(
        metadataSection(page, "metadata-ui.playground.state-coverage"),
      ).toHaveScreenshot("metadata-ui-playground-mobile-state-matrix.png", {
        animations: "disabled",
        caret: "initial",
      });
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
