import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { parseMetadataUiPermissionContract } from "../contracts/permission.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import { parseMetadataUiPresentationContract } from "../contracts/presentation.contract";
import {
  createMetadataUiMigrationReplacementGate,
  type MetadataUiGovernedSurfaceParityNote,
  type MetadataUiGovernedSurfaceKind,
} from "./parity-adapters.shared";

export type GovernedPresentationProfileInput =
  | "dense-table"
  | "metric-card"
  | "chart-panel"
  | "plain"
  | "unknown";

export type GovernedSurfaceChromeInput = Readonly<{
  density?: "compact" | "comfortable" | "spacious" | "legacy";
  elevation?: "none" | "subtle" | "raised";
  material?: "plain" | "card" | "panel" | "legacy-glass";
}>;

export type GovernedPermissionTupleInput = Readonly<{
  module: string;
  object: string;
  function: string;
}>;

export type MetadataUiCompatibilityAdapterResult<Data> = Readonly<{
  data: Data;
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
}>;

function compatibilityNote(
  surface: MetadataUiGovernedSurfaceKind,
  sourceField: string,
  disposition: MetadataUiGovernedSurfaceParityNote["disposition"],
  message: string,
): MetadataUiGovernedSurfaceParityNote {
  return {
    surface,
    sourceField,
    disposition,
    message,
  };
}

export function adaptGovernedPresentationProfile(
  profile: GovernedPresentationProfileInput,
  surface: MetadataUiGovernedSurfaceKind,
): MetadataUiCompatibilityAdapterResult<MetadataUiPresentationContract> {
  if (profile === "unknown") {
    return {
      data: parseMetadataUiPresentationContract({}),
      parityNotes: [
        compatibilityNote(
          surface,
          "presentationProfile",
          "unsupported",
          "Unknown governed presentation profile cannot be migrated automatically.",
        ),
      ],
    };
  }

  const mapped =
    profile === "dense-table"
      ? {
          chrome: { surface: "section", density: "compact" },
          layout: { layout: "table", width: "full" },
        }
      : profile === "metric-card"
        ? {
            chrome: { surface: "card", density: "comfortable", emphasis: "medium" },
            layout: { layout: "grid", width: "full" },
          }
        : profile === "chart-panel"
          ? {
              chrome: { surface: "section", density: "comfortable" },
              layout: { layout: "stack", width: "full" },
            }
          : {
              chrome: { surface: "plain" },
              visibility: { showChrome: false },
            };

  return {
    data: parseMetadataUiPresentationContract(mapped),
    parityNotes: [
      compatibilityNote(
        surface,
        "presentationProfile",
        "mapped",
        "Governed presentation profile mapped to metadata-ui presentation intent.",
      ),
    ],
  };
}

export function adaptGovernedSurfaceChrome(
  chrome: GovernedSurfaceChromeInput,
  surface: MetadataUiGovernedSurfaceKind,
): MetadataUiCompatibilityAdapterResult<MetadataUiPresentationContract> {
  const unsupported = [
    chrome.density === "legacy" ? "density" : undefined,
    chrome.material === "legacy-glass" ? "material" : undefined,
  ].filter((value): value is string => value !== undefined);

  return {
    data: parseMetadataUiPresentationContract({
      chrome: {
        surface:
          chrome.material === "plain"
            ? "plain"
            : chrome.material === "panel"
              ? "section"
              : "card",
        density:
          chrome.density === "compact"
            ? "compact"
            : chrome.density === "spacious"
              ? "spacious"
              : "comfortable",
        emphasis: chrome.elevation === "raised" ? "high" : "medium",
        tone: "neutral",
      },
    }),
    parityNotes: unsupported.map((field) =>
      compatibilityNote(
        surface,
        field,
        "unsupported",
        "Legacy governed chrome value requires visual certification before migration.",
      ),
    ),
  };
}

export function adaptGovernedPermissionTuple(
  permission: GovernedPermissionTupleInput,
): MetadataUiPermissionContract {
  return parseMetadataUiPermissionContract({
    requirements: [
      {
        capability: `${permission.module}.${permission.object}_${permission.function}`,
      },
    ],
  });
}

export function createGovernedParityCertificationGate(input: {
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
  guardPassed: boolean;
  packageBuildPassed: boolean;
  packageTestsPassed: boolean;
  visualCertificationPassed: boolean;
}) {
  return createMetadataUiMigrationReplacementGate({
    parityNotes: input.parityNotes,
    guardPassed: input.guardPassed,
    packageBuildPassed: input.packageBuildPassed,
    packageTestsPassed: input.packageTestsPassed,
    visualEvidence: input.visualCertificationPassed,
    importAuditPassed: true,
  });
}
