import type { MetadataUiFixtureKey } from "./fixture-builders.shared";
import { createMetadataUiFixtureTestId } from "./metadata-ui-test-ids.shared";

export type MetadataUiCertificationViewport = "desktop" | "mobile";

export type MetadataUiCertificationCheck =
  | "deterministic-fixture"
  | "desktop-screenshot"
  | "mobile-screenshot"
  | "no-blank-render"
  | "no-text-overlap"
  | "keyboard-navigation"
  | "reduced-motion"
  | "table-fallback"
  | "current-server-window"
  | "artifact-hygiene";

export type MetadataUiCertificationSurfacePlan = Readonly<{
  surface: MetadataUiFixtureKey;
  fixtureKey: string;
  fixtureTestId: string;
  artifactDirectory: `.artifacts/metadata-ui/e10/${MetadataUiFixtureKey}`;
  screenshots: Readonly<Record<MetadataUiCertificationViewport, string>>;
  requiredChecks: readonly MetadataUiCertificationCheck[];
  notes: readonly string[];
}>;

export type MetadataUiCertificationEvidence = Readonly<{
  surface: MetadataUiFixtureKey;
  capturedAt: string;
  screenshots: Partial<Record<MetadataUiCertificationViewport, string>>;
  completedChecks: readonly MetadataUiCertificationCheck[];
  reviewer?: string;
}>;

export type MetadataUiCertificationEvidenceGate = Readonly<{
  canReplace: boolean;
  blockers: readonly string[];
  requiredEvidence: readonly string[];
}>;

const METADATA_UI_E10_ARTIFACT_ROOT = ".artifacts/metadata-ui/e10" as const;

const METADATA_UI_E10_VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const satisfies Record<MetadataUiCertificationViewport, {
  width: number;
  height: number;
}>;

const METADATA_UI_CERTIFICATION_SURFACES = [
  "action-bar",
  "audit-panel",
  "chart",
  "detail-tabs",
  "form",
  "kanban",
  "list",
  "page-header",
  "stat",
] as const satisfies readonly MetadataUiFixtureKey[];

function createMetadataUiCertificationArtifactDirectory(
  surface: MetadataUiFixtureKey,
): `.artifacts/metadata-ui/e10/${MetadataUiFixtureKey}` {
  return `${METADATA_UI_E10_ARTIFACT_ROOT}/${surface}`;
}

function createMetadataUiCertificationScreenshots(
  surface: MetadataUiFixtureKey,
): Readonly<Record<MetadataUiCertificationViewport, string>> {
  const directory = createMetadataUiCertificationArtifactDirectory(surface);

  return {
    desktop: `${directory}/${METADATA_UI_E10_VIEWPORTS.desktop.width}x${METADATA_UI_E10_VIEWPORTS.desktop.height}.png`,
    mobile: `${directory}/${METADATA_UI_E10_VIEWPORTS.mobile.width}x${METADATA_UI_E10_VIEWPORTS.mobile.height}.png`,
  };
}

function createMetadataUiCertificationChecks(
  surface: MetadataUiFixtureKey,
): readonly MetadataUiCertificationCheck[] {
  const baseChecks: MetadataUiCertificationCheck[] = [
    "deterministic-fixture",
    "desktop-screenshot",
    "mobile-screenshot",
    "no-blank-render",
    "no-text-overlap",
    "artifact-hygiene",
  ];

  if (surface === "list") {
    return [...baseChecks, "keyboard-navigation", "current-server-window"];
  }

  if (surface === "form") {
    return [...baseChecks, "keyboard-navigation"];
  }

  if (surface === "chart") {
    return [...baseChecks, "reduced-motion", "table-fallback"];
  }

  if (surface === "kanban" || surface === "stat") {
    return [...baseChecks, "reduced-motion"];
  }

  return baseChecks;
}

function createMetadataUiCertificationNotes(
  surface: MetadataUiFixtureKey,
): readonly string[] {
  if (surface === "list") {
    return [
      "Verify the rendered table uses only the current server window.",
      "Verify toolbar and selection controls remain keyboard reachable.",
    ];
  }

  if (surface === "form") {
    return [
      "Verify native field focus order and error summary visibility.",
      "Verify dirty state remains local and host submission remains external.",
    ];
  }

  if (surface === "chart") {
    return [
      "Verify chart body is nonblank at both viewport sizes.",
      "Verify screen-reader table fallback remains present.",
    ];
  }

  if (surface === "kanban") {
    return [
      "Verify reduced-motion mode removes movement animation.",
      "Verify move intent metadata is visible without executing commands.",
    ];
  }

  if (surface === "stat") {
    return [
      "Verify animated values respect reduced-motion behavior.",
      "Verify progress and sparkline labels remain accessible.",
    ];
  }

  return [
    "Verify desktop and mobile screenshots have no text overlap.",
    "Verify deterministic data attributes are present for certification.",
  ];
}

export function createMetadataUiVisualCertificationPlan():
  readonly MetadataUiCertificationSurfacePlan[] {
  return METADATA_UI_CERTIFICATION_SURFACES.map((surface) => ({
    surface,
    fixtureKey: `metadata-ui.fixture.${surface}`,
    fixtureTestId: createMetadataUiFixtureTestId(surface),
    artifactDirectory: createMetadataUiCertificationArtifactDirectory(surface),
    screenshots: createMetadataUiCertificationScreenshots(surface),
    requiredChecks: createMetadataUiCertificationChecks(surface),
    notes: createMetadataUiCertificationNotes(surface),
  }));
}

export function createMetadataUiCertificationBlockers(
  plans: readonly MetadataUiCertificationSurfacePlan[],
): readonly string[] {
  return plans.flatMap((plan) => {
    const missingChecks = [
      "deterministic-fixture",
      "desktop-screenshot",
      "mobile-screenshot",
      "no-blank-render",
      "no-text-overlap",
      "artifact-hygiene",
    ].filter((check) =>
      !plan.requiredChecks.includes(check as MetadataUiCertificationCheck),
    );
    const artifactBlocker = plan.artifactDirectory.startsWith(
      METADATA_UI_E10_ARTIFACT_ROOT,
    )
      ? []
      : [`${plan.surface}:artifact-root`];

    return [
      ...missingChecks.map((check) => `${plan.surface}:${check}`),
      ...artifactBlocker,
    ];
  });
}

function createMetadataUiEvidenceBySurface(
  evidence: readonly MetadataUiCertificationEvidence[],
): ReadonlyMap<MetadataUiFixtureKey, MetadataUiCertificationEvidence> {
  return new Map(evidence.map((entry) => [entry.surface, entry]));
}

function getMetadataUiMissingEvidenceChecks(
  plan: MetadataUiCertificationSurfacePlan,
  evidence: MetadataUiCertificationEvidence | undefined,
): readonly string[] {
  if (!evidence) {
    return [`${plan.surface}:missing-evidence`];
  }

  const completedChecks = new Set(evidence.completedChecks);
  const missingChecks = plan.requiredChecks
    .filter((check) => !completedChecks.has(check))
    .map((check) => `${plan.surface}:${check}`);
  const missingScreenshots = (["desktop", "mobile"] as const)
    .filter((viewport) => evidence.screenshots[viewport] !== plan.screenshots[viewport])
    .map((viewport) => `${plan.surface}:${viewport}-screenshot-artifact`);
  const staleEvidence = Number.isNaN(Date.parse(evidence.capturedAt))
    ? [`${plan.surface}:captured-at`]
    : [];

  return [...missingChecks, ...missingScreenshots, ...staleEvidence];
}

export function createMetadataUiCertificationEvidenceGate(input: {
  plans: readonly MetadataUiCertificationSurfacePlan[];
  evidence: readonly MetadataUiCertificationEvidence[];
}): MetadataUiCertificationEvidenceGate {
  const planBlockers = createMetadataUiCertificationBlockers(input.plans);
  const evidenceBySurface = createMetadataUiEvidenceBySurface(input.evidence);
  const evidenceBlockers = input.plans.flatMap((plan) =>
    getMetadataUiMissingEvidenceChecks(plan, evidenceBySurface.get(plan.surface)),
  );
  const blockers = [...planBlockers, ...evidenceBlockers];

  return {
    canReplace: blockers.length === 0,
    blockers,
    requiredEvidence: [
      "deterministic package fixture per surface",
      "desktop screenshot artifact per surface",
      "mobile screenshot artifact per surface",
      "no-blank-render verification",
      "no-text-overlap verification",
      "keyboard verification for table and form",
      "reduced-motion verification for chart, stat, and kanban",
      "screen-reader table fallback verification for chart",
      "artifacts stored under .artifacts/metadata-ui/e10/",
    ],
  };
}
