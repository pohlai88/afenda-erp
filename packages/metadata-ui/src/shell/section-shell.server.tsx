import "server-only";

import type { ReactNode } from "react";

import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import {
  createMetadataUiSectionIdentity,
  type MetadataUiDiagnosticsInput,
} from "../identity/identity.shared";
import { resolveMetadataUiPresentation } from "../presentation/resolve-presentation.shared";
import { shouldRenderMetadataUiPresentationHeader } from "../presentation/resolve-visibility.shared";
import { safeResolveMetadataUiSectionBody } from "./section-body-resolver.server";
import { MetadataUiEmptyState } from "./empty-state.server";
import { MetadataUiHeading, type MetadataUiHeadingLevel } from "./heading.server";
import { MetadataUiSectionCard } from "./section-card.server";

export type MetadataUiSectionShellDiagnostics = MetadataUiDiagnosticsInput;

export type MetadataUiSectionShellProps = Readonly<{
  sectionKind: MetadataUiSectionKind;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
  headingLevel?: MetadataUiHeadingLevel;
  presentation?: MetadataUiPresentationContract;
  diagnostics?: MetadataUiSectionShellDiagnostics;
}>;

export function MetadataUiSectionShell({
  sectionKind,
  title,
  description,
  actions,
  children,
  id,
  headingLevel = 2,
  presentation,
  diagnostics,
}: MetadataUiSectionShellProps) {
  const resolution = safeResolveMetadataUiSectionBody(sectionKind);
  const identity = createMetadataUiSectionIdentity({
    sectionKind,
    key: diagnostics?.sectionKey ?? id ?? sectionKind,
    id,
    diagnostics,
  });
  const resolvedPresentation = resolveMetadataUiPresentation(presentation);
  const headingId = title ? `${identity.id}-heading` : undefined;
  const showHeader =
    shouldRenderMetadataUiPresentationHeader(resolvedPresentation) &&
    Boolean(title);

  if (resolution.state === "error") {
    const message =
      resolution.diagnostics[0]?.message ??
      `Metadata UI section "${sectionKind}" cannot be resolved.`;

    return (
      <MetadataUiSectionCard
        labelledBy={headingId}
        presentation={resolvedPresentation}
        diagnostics={identity.diagnostics}
        domAttributes={identity.domAttributes}
      >
        <MetadataUiEmptyState
          title="Section unavailable"
          description={message}
          tone="critical"
        />
      </MetadataUiSectionCard>
    );
  }

  return (
    <MetadataUiSectionCard
      labelledBy={headingId}
      presentation={resolvedPresentation}
      diagnostics={identity.diagnostics}
      domAttributes={identity.domAttributes}
    >
      <div className="metadata-ui-section-shell space-y-4">
        {showHeader && title ? (
          <MetadataUiHeading
            id={headingId}
            title={title}
            description={description}
            actions={actions}
            level={headingLevel}
            presentation={resolvedPresentation}
          />
        ) : null}
        {children}
      </div>
    </MetadataUiSectionCard>
  );
}
