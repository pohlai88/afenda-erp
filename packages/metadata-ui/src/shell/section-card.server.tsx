import "server-only";

import type { ReactNode } from "react";

import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import type { MetadataUiDomAttributes } from "../identity/identity.shared";
import { MetadataUiPrimitiveCard } from "../primitives/card.server";
import { shouldRenderMetadataUiPresentationChrome } from "../presentation/resolve-surface.shared";

export type MetadataUiSectionCardProps = Readonly<{
  children: ReactNode;
  id?: string;
  labelledBy?: string;
  presentation?: MetadataUiPresentationContract;
  diagnostics?: Record<string, string | undefined>;
  domAttributes?: MetadataUiDomAttributes;
}>;

export function MetadataUiSectionCard({
  children,
  id,
  labelledBy,
  presentation,
  diagnostics,
  domAttributes,
}: MetadataUiSectionCardProps) {
  const showChrome = shouldRenderMetadataUiPresentationChrome(presentation);
  const resolvedDiagnostics = domAttributes
    ? {}
    : {
        "data-metadata-ui-component": diagnostics?.componentKey,
        "data-metadata-ui-section": diagnostics?.sectionKey,
        "data-metadata-ui-renderer": diagnostics?.rendererKey,
        "data-testid": diagnostics?.testId,
      };

  if (!showChrome) {
    return (
      <section
        {...domAttributes}
        {...resolvedDiagnostics}
        id={domAttributes?.id ?? id}
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      {...domAttributes}
      {...resolvedDiagnostics}
      id={domAttributes?.id ?? id}
      aria-labelledby={labelledBy}
      className="metadata-ui-section-card"
    >
      <MetadataUiPrimitiveCard presentation={presentation}>
        {children}
      </MetadataUiPrimitiveCard>
    </section>
  );
}
