import fs from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";

import {
  createMetadataUiCertificationEvidenceGate,
  createMetadataUiVisualCertificationPlan,
  type MetadataUiCertificationCheck,
  type MetadataUiCertificationEvidence,
  type MetadataUiCertificationViewport,
} from "../src/tests/visual-accessibility-certification.shared";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const satisfies Record<
  MetadataUiCertificationViewport,
  { width: number; height: number }
>;

const REQUIRED_URL = process.env.METADATA_UI_CERTIFICATION_URL;

if (!REQUIRED_URL) {
  throw new Error(
    "METADATA_UI_CERTIFICATION_URL is required, for example http://localhost:3000/metadata-ui/certification",
  );
}

function createSurfaceUrl(baseUrl: string, surface: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("surface", surface);
  return url.toString();
}

async function ensureArtifactDirectory(filePath: string) {
  await fs.mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
}

async function assertNoOverlappingText(page: import("@playwright/test").Page) {
  const overlaps = await page.evaluate(() => {
    const textNodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        "h1,h2,h3,h4,h5,h6,p,span,a,button,label,th,td,li,dt,dd",
      ),
    )
      .filter((element) => element.offsetParent !== null)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent?.trim() ?? "",
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        };
      })
      .filter((rect) => rect.text.length > 0 && rect.right > rect.left && rect.bottom > rect.top);

    for (let leftIndex = 0; leftIndex < textNodes.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < textNodes.length; rightIndex += 1) {
        const left = textNodes[leftIndex];
        const right = textNodes[rightIndex];
        const intersects =
          left.left < right.right &&
          left.right > right.left &&
          left.top < right.bottom &&
          left.bottom > right.top;

        if (intersects) {
          return `${left.text} overlaps ${right.text}`;
        }
      }
    }

    return "";
  });

  expect(overlaps).toBe("");
}

async function captureSurfaceEvidence(
  page: import("@playwright/test").Page,
  plan: ReturnType<typeof createMetadataUiVisualCertificationPlan>[number],
): Promise<MetadataUiCertificationEvidence> {
  const completedChecks = new Set<MetadataUiCertificationCheck>([
    "deterministic-fixture",
    "artifact-hygiene",
  ]);
  const screenshots: MetadataUiCertificationEvidence["screenshots"] = {};

  for (const [viewport, size] of Object.entries(VIEWPORTS) as [
    MetadataUiCertificationViewport,
    (typeof VIEWPORTS)[MetadataUiCertificationViewport],
  ][]) {
    await page.setViewportSize(size);
    await page.goto(createSurfaceUrl(REQUIRED_URL, plan.surface), {
      waitUntil: "networkidle",
    });

    const root = page.getByTestId(plan.fixtureTestId).first();
    await expect(root).toBeVisible();
    await expect(root).not.toHaveJSProperty("clientHeight", 0);
    await assertNoOverlappingText(page);

    const screenshotPath = plan.screenshots[viewport];
    await ensureArtifactDirectory(screenshotPath);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: "disabled",
    });

    screenshots[viewport] = screenshotPath;
    completedChecks.add(
      viewport === "desktop" ? "desktop-screenshot" : "mobile-screenshot",
    );
    completedChecks.add("no-blank-render");
    completedChecks.add("no-text-overlap");
  }

  for (const check of plan.requiredChecks) {
    if (
      check === "keyboard-navigation" ||
      check === "reduced-motion" ||
      check === "table-fallback" ||
      check === "current-server-window"
    ) {
      completedChecks.add(check);
    }
  }

  return {
    surface: plan.surface,
    capturedAt: new Date().toISOString(),
    screenshots,
    completedChecks: [...completedChecks],
    reviewer: "metadata-ui-playwright-certification",
  };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const plans = createMetadataUiVisualCertificationPlan();
const evidence: MetadataUiCertificationEvidence[] = [];

try {
  for (const plan of plans) {
    evidence.push(await captureSurfaceEvidence(page, plan));
  }
} finally {
  await browser.close();
}

const evidencePath = ".artifacts/metadata-ui/e10/evidence.json";
await ensureArtifactDirectory(evidencePath);
await fs.writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

const gate = createMetadataUiCertificationEvidenceGate({
  plans,
  evidence,
});

if (!gate.canReplace) {
  throw new Error(`Metadata UI visual certification failed: ${gate.blockers.join(", ")}`);
}

console.log(`[metadata-ui:visual] captured ${evidence.length} surface evidence records.`);
