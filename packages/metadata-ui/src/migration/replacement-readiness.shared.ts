import type {
  MetadataUiGovernedSurfaceKind,
  MetadataUiGovernedSurfaceParityNote,
} from "./parity-adapters.shared";

export type MetadataUiReplacementTarget = Readonly<{
  featureKey: string;
  surfaces: readonly MetadataUiGovernedSurfaceKind[];
}>;

export type MetadataUiReplacementEvidence = Readonly<{
  guardPassed: boolean;
  packageBuildPassed: boolean;
  packageTestsPassed: boolean;
  visualCertificationPassed: boolean;
  importAuditPassed: boolean;
}>;

export type MetadataUiReplacementReadiness = Readonly<{
  canReplace: boolean;
  featureKey: string;
  blockers: readonly string[];
  requiredEvidence: readonly string[];
}>;

const REQUIRED_REPLACEMENT_EVIDENCE = [
  "pnpm guard:metadata-ui",
  "pnpm --filter @afenda/metadata-ui build",
  "pnpm --filter @afenda/metadata-ui test",
  "visual certification evidence for each target surface",
  "target feature import audit has no governed-surface-only behavior",
  "no metadata-ui import of feature packages, ERP repositories, tenant session internals, or domain commands",
] as const;

function createSurfaceSet(
  surfaces: readonly MetadataUiGovernedSurfaceKind[],
): ReadonlySet<MetadataUiGovernedSurfaceKind> {
  return new Set(surfaces);
}

function createUnsupportedParityBlockers(
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[],
  targetSurfaces: ReadonlySet<MetadataUiGovernedSurfaceKind>,
): readonly string[] {
  return parityNotes
    .filter((note) =>
      note.disposition === "unsupported" && targetSurfaces.has(note.surface),
    )
    .map((note) => `${note.surface}:${note.sourceField}`);
}

function createEvidenceBlockers(
  evidence: MetadataUiReplacementEvidence,
): readonly string[] {
  return [
    ...(evidence.guardPassed ? [] : ["guard:metadata-ui"]),
    ...(evidence.packageBuildPassed ? [] : ["metadata-ui:build"]),
    ...(evidence.packageTestsPassed ? [] : ["metadata-ui:test"]),
    ...(evidence.visualCertificationPassed ? [] : ["visual-certification"]),
    ...(evidence.importAuditPassed ? [] : ["feature-import-audit"]),
  ];
}

export function createMetadataUiReplacementReadiness(input: {
  target: MetadataUiReplacementTarget;
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
  evidence: MetadataUiReplacementEvidence;
}): MetadataUiReplacementReadiness {
  const targetSurfaces = createSurfaceSet(input.target.surfaces);
  const blockers = [
    ...(input.target.surfaces.length === 0 ? ["target-surfaces"] : []),
    ...createUnsupportedParityBlockers(input.parityNotes, targetSurfaces),
    ...createEvidenceBlockers(input.evidence),
  ];

  return {
    canReplace: blockers.length === 0,
    featureKey: input.target.featureKey,
    blockers,
    requiredEvidence: REQUIRED_REPLACEMENT_EVIDENCE,
  };
}
