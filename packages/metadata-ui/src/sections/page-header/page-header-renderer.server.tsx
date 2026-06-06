import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { createMetadataUiSectionIdentity } from "../../identity/identity.shared";
import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import {
  parseMetadataUiPageHeader,
  type MetadataUiPageHeaderInput,
} from "../../schemas/page-header.schema";
import { MetadataUiHeading } from "../../shell/heading.server";

export type MetadataUiPageHeaderRendererProps = Readonly<{
  metadata: MetadataUiPageHeaderInput;
}>;

export function MetadataUiPageHeaderRenderer({
  metadata,
}: MetadataUiPageHeaderRendererProps) {
  const header = parseMetadataUiPageHeader(metadata);
  const identity = createMetadataUiSectionIdentity({
    sectionKind: "page-header",
    key: header.key,
    id: header.key,
    diagnostics: header.diagnostics,
  });

  return (
    <header
      {...identity.domAttributes}
      className={cn("metadata-ui-page-header grid", ui.surfaceGap.md)}
    >
      {header.breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol
            className={cn(
              "flex flex-wrap items-center",
              ui.surfaceGap.sm,
              ui.typography.muted,
            )}
          >
            {header.breadcrumbs.map((breadcrumb) => (
              <li
                key={breadcrumb.key}
                aria-current={breadcrumb.current ? "page" : undefined}
              >
                {breadcrumb.href && !breadcrumb.current ? (
                  <a href={breadcrumb.href} className="hover:text-foreground">
                    {breadcrumb.label}
                  </a>
                ) : (
                  breadcrumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <MetadataUiHeading
        id={header.key}
        title={header.title}
        description={header.description}
        eyebrow={header.eyebrow}
        presentation={header.presentation}
        level={header.level === "workspace" ? 1 : 2}
      />
      {header.badges.length > 0 ? (
        <div className={cn("flex flex-wrap", ui.surfaceGap.sm)}>
          {header.badges.map((badge) => (
            <MetadataUiPrimitiveBadge key={badge.key} tone={badge.tone}>
              {badge.label}
            </MetadataUiPrimitiveBadge>
          ))}
        </div>
      ) : null}
      {header.actions.length > 0 ? (
        <div className={cn("flex flex-wrap items-center", ui.surfaceGap.sm)}>
          {header.actions.map((item) => (
            <MetadataUiPrimitiveActionButton
              key={item.action.id}
              action={item.action}
              priority={
                item.placement === "primary"
                  ? "primary"
                  : item.placement === "secondary"
                    ? "secondary"
                    : "tertiary"
              }
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}

export default MetadataUiPageHeaderRenderer;
