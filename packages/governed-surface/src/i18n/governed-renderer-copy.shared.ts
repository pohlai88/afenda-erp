import type { GovernedComponentRendererDiagnostics } from "../metadata/registry";

export const governedRendererCopy = {
  parseError: {
    surface: {
      userTitle: "Section unavailable",
      userDescription: "This section could not be loaded safely.",
      operatorDescription: "The surface configuration failed validation.",
    },
    statCard: {
      userTitle: "Card unavailable",
      userDescription: "This card could not be loaded safely.",
      operatorDescription: "The stat card configuration failed validation.",
    },
    approvalTimeline: {
      userTitle: "Timeline unavailable",
      userDescription: "This timeline could not be loaded safely.",
      operatorDescription: "The approval timeline configuration failed validation.",
    },
    listSurface: {
      userTitle: "List unavailable",
      userDescription: "This list could not be loaded safely.",
      operatorDescription: "The list surface configuration failed validation.",
    },
    chart: {
      userTitle: "Chart unavailable",
      userDescription: "This chart could not be loaded safely.",
      operatorDescription: "The chart configuration failed validation.",
    },
    actionBar: {
      userTitle: "Actions unavailable",
      userDescription: "This action bar could not be loaded safely.",
      operatorDescription: "The action bar configuration failed validation.",
    },
    auditPanel: {
      userTitle: "Audit panel unavailable",
      userDescription: "This audit panel could not be loaded safely.",
      operatorDescription: "The audit panel configuration failed validation.",
    },
    detailTabs: {
      userTitle: "Detail tabs unavailable",
      userDescription: "This detail view could not be loaded safely.",
      operatorDescription: "The detail tabs configuration failed validation.",
    },
    multiStepForm: {
      userTitle: "Form unavailable",
      userDescription: "This form could not be loaded safely.",
      operatorDescription: "The wizard configuration failed validation.",
    },
    scorecardForm: {
      userTitle: "Scorecard unavailable",
      userDescription: "This scorecard could not be loaded safely.",
      operatorDescription: "The scorecard configuration failed validation.",
    },
    empty: {
      userTitle: "State unavailable",
      userDescription: "This empty state could not be loaded safely.",
      operatorDescription: "The empty state configuration failed validation.",
    },
  },
  dispatch: {
    parseFailed: {
      userDescription: "This section could not be loaded safely.",
      operatorDescription: "The governed component payload failed validation.",
    },
    unregistered: {
      userDescription: "This section is not available in the current surface.",
    },
    natureMismatch: {
      userDescription: "This section is not available in the current surface.",
    },
  },
  detailTabs: {
    tabLabels: {
      relations: "Relations",
      referrers: "Referrers",
      revisions: "Revisions",
      audit: "Audit",
    },
    overviewHidden: {
      title: "Overview hidden",
      description: "This overview section is marked hidden.",
    },
    revisions: {
      emptyTitle: "No revision history.",
      columns: {
        when: "When",
        verb: "Verb",
        actor: "Actor",
        narrative: "Narrative",
      },
    },
  },
  empty: {
    statCard: {
      title: "No metrics configured.",
      description: "Add metrics in the surface builder or switch to a view that includes KPIs.",
    },
    approvalTimeline: {
      title: "No approval steps recorded.",
      description: "Steps appear here when an approval flow is active for this record.",
    },
    kanbanBoard: {
      title: "No workflow columns configured.",
      description: "Define columns in the board configuration to display cards.",
    },
    multiStepForm: {
      title: "No form steps configured.",
      description: "Add steps in the wizard configuration before rendering this surface.",
    },
    scorecardForm: {
      title: "No scoring criteria configured.",
      description: "Add criteria in the scorecard configuration.",
    },
    auditPanel: {
      title: "No audit events recorded.",
      description: "Activity appears here when changes are captured for this record.",
    },
  },
} as const;

export type GovernedRendererParseErrorKind = keyof typeof governedRendererCopy.parseError;

export function governedParseErrorCopy(
  diagnostics: GovernedComponentRendererDiagnostics,
  kind: GovernedRendererParseErrorKind,
  operatorDetail?: string,
): { title: string; description: string } {
  const entry = governedRendererCopy.parseError[kind];
  return {
    title: entry.userTitle,
    description:
      diagnostics === "operator"
        ? (operatorDetail ?? entry.operatorDescription)
        : entry.userDescription,
  };
}

/** Generic surface parse failure with optional operator detail override. */
export function governedSurfaceParseErrorCopy(
  diagnostics: GovernedComponentRendererDiagnostics,
  operatorDetail?: string,
): { title: string; description: string } {
  const entry = governedRendererCopy.parseError.surface;
  return {
    title: entry.userTitle,
    description:
      diagnostics === "operator"
        ? (operatorDetail ?? entry.operatorDescription)
        : entry.userDescription,
  };
}

export function governedDispatchErrorCopy(
  diagnostics: GovernedComponentRendererDiagnostics,
  kind: "parseFailed" | "unregistered" | "natureMismatch",
  operatorDetail: string,
): { title: string; description: string } {
  const surface = governedRendererCopy.parseError.surface;
  const dispatchEntry = governedRendererCopy.dispatch[kind];
  return {
    title: surface.userTitle,
    description:
      diagnostics === "operator"
        ? operatorDetail
        : dispatchEntry.userDescription,
  };
}
