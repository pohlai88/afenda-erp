import "server-only";

import { Fragment, type ComponentProps, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "./action-button.server";
import { MetadataUiPrimitiveActionMenu } from "./action-menu.server";
import { MetadataUiPrimitiveBadge } from "./badge.server";
import {
  parseMetadataUiPageHeader,
  type MetadataUiPageHeaderInput,
  type MetadataUiPageHeaderAction,
  type MetadataUiPageHeaderBadge,
  type MetadataUiPageHeaderBreadcrumb,
} from "../schemas/page-header.schema";

export type MetadataUiPrimitivePageHeaderProps = Readonly<{
  header: MetadataUiPageHeaderInput;
  className?: string;
  breadcrumbsClassName?: string;
  badgesClassName?: string;
  actionsClassName?: string;
  heading?: ReactNode;
}> &
  Omit<ComponentProps<"header">, "children" | "className">;

const HEADER_ACTION_PRIORITY_BY_PLACEMENT = {
  primary: "primary",
  secondary: "secondary",
  overflow: "tertiary",
} as const satisfies Record<MetadataUiPageHeaderAction["placement"], "primary" | "secondary" | "tertiary">;

const HEADER_BADGE_TONE_BY_TONE = {
  neutral: "neutral",
  info: "info",
  positive: "positive",
  warning: "warning",
  critical: "critical",
} as const satisfies Record<MetadataUiPageHeaderBadge["tone"], "neutral" | "info" | "positive" | "warning" | "critical">;

function shouldUseMetadataUiPageHeaderActionMenu(
  actions: readonly MetadataUiPageHeaderAction[],
): boolean {
  return actions.every((action) => !action.action.confirmation);
}

function renderMetadataUiPageHeaderBreadcrumbs(
  breadcrumbs: readonly MetadataUiPageHeaderBreadcrumb[],
): ReactNode {
  if (breadcrumbs.length === 0) {
    return null;
  }

  const overflow = breadcrumbs.length > 4;
  const visibleBreadcrumbs = overflow
    ? ([breadcrumbs[0], breadcrumbs[breadcrumbs.length - 2], breadcrumbs[breadcrumbs.length - 1]]
        .filter(
          (breadcrumb): breadcrumb is MetadataUiPageHeaderBreadcrumb =>
            Boolean(breadcrumb),
        ) as readonly MetadataUiPageHeaderBreadcrumb[])
    : breadcrumbs;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {overflow ? (
          <>
            {breadcrumbs[0] ? (
              <Fragment key={breadcrumbs[0].key}>
                <BreadcrumbItem>
                  {breadcrumbs[0].current || !breadcrumbs[0].href ? (
                    <BreadcrumbPage>{breadcrumbs[0].label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild href={breadcrumbs[0].href}>
                      <a>{breadcrumbs[0].label}</a>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {visibleBreadcrumbs.slice(1).map((breadcrumb, index, array) => (
              <Fragment key={breadcrumb.key}>
                <BreadcrumbItem>
                  {breadcrumb.current || !breadcrumb.href ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild href={breadcrumb.href}>
                      <a>{breadcrumb.label}</a>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < array.length - 1 ? <BreadcrumbSeparator /> : null}
              </Fragment>
            ))}
          </>
        ) : (
          breadcrumbs.map((breadcrumb, index, array) => (
            <Fragment key={breadcrumb.key}>
              <BreadcrumbItem>
                {breadcrumb.current || !breadcrumb.href ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild href={breadcrumb.href}>
                    <a>{breadcrumb.label}</a>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < array.length - 1 ? <BreadcrumbSeparator /> : null}
            </Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function renderMetadataUiPageHeaderButtons(
  actions: readonly MetadataUiPageHeaderAction[],
) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-surface-xs">
      {actions.map((item) => (
        <MetadataUiPrimitiveActionButton
          key={item.action.id}
          action={item.action}
          priority={HEADER_ACTION_PRIORITY_BY_PLACEMENT[item.placement]}
        />
      ))}
    </div>
  );
}

function renderMetadataUiPageHeaderOverflowActions(
  actions: readonly MetadataUiPageHeaderAction[],
) {
  const visibleActions = actions.filter(
    (action) => action.action.visibility !== "hidden",
  );

  if (visibleActions.length === 0) {
    return null;
  }

  if (shouldUseMetadataUiPageHeaderActionMenu(visibleActions)) {
    return (
      <MetadataUiPrimitiveActionMenu
        triggerLabel="More actions"
        items={visibleActions.map((item) => ({
          key: item.action.id,
          label: item.action.label,
          description: item.action.description,
          action: item.action,
          tone:
            item.action.risk === "critical" || item.action.risk === "high"
              ? "destructive"
              : "neutral",
          disabled: item.action.visibility === "disabled",
          disabledReason: item.action.disabledReason,
        }))}
      />
    );
  }

  return renderMetadataUiPageHeaderButtons(visibleActions);
}

function renderMetadataUiPageHeaderBadges(badges: readonly MetadataUiPageHeaderBadge[]) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-surface-xs")}>
      {badges.map((badge) => (
        <MetadataUiPrimitiveBadge key={badge.key} tone={HEADER_BADGE_TONE_BY_TONE[badge.tone]}>
          {badge.label}
        </MetadataUiPrimitiveBadge>
      ))}
    </div>
  );
}

function renderMetadataUiPageHeaderHeading(input: {
  header: ReturnType<typeof parseMetadataUiPageHeader>;
  actions: ReactNode;
}) {
  const HeadingTag = input.header.level === "workspace" ? "h1" : "h2";
  const titleClassName =
    input.header.level === "workspace"
      ? ui.typography.pageTitle
      : ui.typography.sectionTitle;

  return (
    <div className={cn("flex min-w-0 items-start justify-between", ui.surfaceGap.md)}>
      <div className={cn("grid min-w-0", ui.surfaceGap.xs)}>
        {input.header.eyebrow ? (
          <p className={ui.typography.label}>{input.header.eyebrow}</p>
        ) : null}
        <HeadingTag id={input.header.key} className={titleClassName}>
          {input.header.title}
        </HeadingTag>
        {input.header.description ? (
          <p className={cn("max-w-3xl", ui.typography.muted)}>
            {input.header.description}
          </p>
        ) : null}
      </div>
      {input.actions ? <div className="shrink-0">{input.actions}</div> : null}
    </div>
  );
}

export function MetadataUiPrimitivePageHeader({
  header,
  className,
  breadcrumbsClassName,
  badgesClassName,
  actionsClassName,
  heading,
  ...domAttributes
}: MetadataUiPrimitivePageHeaderProps) {
  const resolvedHeader = parseMetadataUiPageHeader(header);
  const primaryActions = resolvedHeader.actions.filter(
    (action) => action.placement !== "overflow",
  );
  const overflowActions = resolvedHeader.actions.filter(
    (action) => action.placement === "overflow",
  );

  return (
    <header
      {...domAttributes}
      className={cn("metadata-ui-page-header grid", ui.surfaceGap.md, className)}
      role={resolvedHeader.level === "workspace" ? "banner" : undefined}
      aria-label={resolvedHeader.title}
      data-metadata-ui-page-header={resolvedHeader.key}
      data-metadata-ui-page-header-level={resolvedHeader.level}
      data-metadata-ui-page-header-breadcrumbs={resolvedHeader.breadcrumbs.length}
      data-metadata-ui-page-header-badges={resolvedHeader.badges.length}
      data-metadata-ui-page-header-actions={resolvedHeader.actions.length}
      data-metadata-ui-page-header-primary-actions={primaryActions.length}
      data-metadata-ui-page-header-overflow-actions={overflowActions.length}
    >
      {resolvedHeader.breadcrumbs.length > 0 ? (
        <div className={cn("min-w-0", breadcrumbsClassName)}>
          {renderMetadataUiPageHeaderBreadcrumbs(resolvedHeader.breadcrumbs)}
        </div>
      ) : null}
      {heading ??
        renderMetadataUiPageHeaderHeading({
          header: resolvedHeader,
          actions: renderMetadataUiPageHeaderButtons(primaryActions),
        })}
      {resolvedHeader.badges.length > 0 ? (
        <div className={cn(badgesClassName)}>{renderMetadataUiPageHeaderBadges(resolvedHeader.badges)}</div>
      ) : null}
      {overflowActions.length > 0 ? (
        <div className={cn("flex flex-wrap justify-end", actionsClassName)}>
          {renderMetadataUiPageHeaderOverflowActions(overflowActions)}
        </div>
      ) : null}
    </header>
  );
}
