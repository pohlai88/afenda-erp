import "server-only";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveActionMenu } from "../../primitives/action-menu.server";
import {
  type MetadataUiActionBar,
  type MetadataUiActionBarInput,
  type MetadataUiActionBarItem,
  type MetadataUiActionBarItemPriority,
  parseMetadataUiActionBar,
} from "../../schemas/action-bar.schema";
import {
  resolveMetadataUiActionLifecycle,
  type MetadataUiResolvedActionLifecycle,
} from "../../server-actions/action-lifecycle.shared";

export type MetadataUiActionBarRendererProps = Readonly<{
  metadata: MetadataUiActionBarInput;
}>;

type MetadataUiResolvedActionBarItem = MetadataUiActionBarItem & {
  resolvedLabel: string;
  resolvedPriority: MetadataUiActionBarItemPriority;
  lifecycle: MetadataUiResolvedActionLifecycle;
  disabledReason?: string;
};

type MetadataUiSplitActionBarItems = Readonly<{
  pinned: MetadataUiResolvedActionBarItem[];
  contextual: MetadataUiResolvedActionBarItem[];
}>;

const ACTION_BAR_ALIGNMENT_CLASS = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const satisfies Record<MetadataUiActionBar["alignment"], string>;

function resolveMetadataUiActionBarItem(
  item: MetadataUiActionBarItem,
): MetadataUiResolvedActionBarItem {
  const action = item.action;
  const actionRisk = action?.risk;
  const resolvedPriority =
    item.priority === "danger" ||
    actionRisk === "high" ||
    actionRisk === "critical"
      ? "danger"
      : item.priority;
  const lifecycle = resolveMetadataUiActionLifecycle(action, {
    disabled: item.disabled?.value,
    disabledReason: item.disabled?.reason,
  });

  return {
    ...item,
    resolvedLabel: item.label ?? action?.label ?? item.key,
    resolvedPriority,
    lifecycle,
    disabledReason: lifecycle.disabledReason,
  };
}

function shouldRenderMetadataUiActionBarItem(
  item: MetadataUiResolvedActionBarItem,
): boolean {
  return item.action?.visibility !== "hidden";
}

function shouldPinMetadataUiActionBarItem(
  item: MetadataUiResolvedActionBarItem,
): boolean {
  return (
    item.placement === "main" ||
    item.resolvedPriority === "primary" ||
    item.resolvedPriority === "danger" ||
    Boolean(item.action?.confirmation)
  );
}

function shouldUseMetadataUiActionMenu(
  items: readonly MetadataUiResolvedActionBarItem[],
): boolean {
  return items.every((item) => !item.action?.confirmation);
}

function splitMetadataUiActionBarItems(actionBar: MetadataUiActionBar) {
  const split = actionBar.actions.reduce<MetadataUiSplitActionBarItems>(
    (groups, actionBarItem) => {
      const item = resolveMetadataUiActionBarItem(actionBarItem);

      if (!shouldRenderMetadataUiActionBarItem(item)) {
        return groups;
      }

      if (shouldPinMetadataUiActionBarItem(item)) {
        groups.pinned.push(item);
      } else {
        groups.contextual.push(item);
      }

      return groups;
    },
    {
      pinned: [],
      contextual: [],
    },
  );
  const collapseAfter = actionBar.overflow.enabled
    ? actionBar.overflow.collapseAfter
    : undefined;
  const main = collapseAfter ? split.pinned.slice(0, collapseAfter) : split.pinned;
  const overflow = collapseAfter
    ? [...split.pinned.slice(collapseAfter), ...split.contextual]
    : split.contextual;

  return {
    main,
    overflow,
  };
}

export function MetadataUiActionBarRenderer({
  metadata,
}: MetadataUiActionBarRendererProps) {
  const actionBar = parseMetadataUiActionBar(metadata);
  const { main, overflow } = splitMetadataUiActionBarItems(actionBar);
  const useActionMenu = shouldUseMetadataUiActionMenu(overflow);

  return (
    <div
      className={cn(
        "metadata-ui-action-bar flex flex-wrap items-center rounded-section border border-border/70 bg-card p-surface-sm shadow-sm",
        ui.surfaceGap.sm,
        ACTION_BAR_ALIGNMENT_CLASS[actionBar.alignment],
      )}
      data-metadata-ui-action-bar={actionBar.key}
      data-metadata-ui-action-bar-layout={actionBar.layout}
      data-metadata-ui-action-bar-main-count={main.length}
      data-metadata-ui-action-bar-overflow-count={overflow.length}
      role="toolbar"
      aria-label={actionBar.title ?? "Action bar"}
    >
      {main.map((item) => (
        <MetadataUiPrimitiveActionButton
          key={item.key}
          action={item.action}
          label={item.resolvedLabel}
          priority={item.resolvedPriority}
          state={item.disabled?.value ? "disabled" : item.lifecycle.state}
          disabledReason={item.disabledReason}
          testId={item.diagnostics?.testId}
        />
      ))}
      {overflow.length > 0 ? (
        useActionMenu ? (
          <MetadataUiPrimitiveActionMenu
            title={actionBar.overflow.triggerLabel}
            triggerLabel={actionBar.overflow.triggerLabel}
            items={overflow.map((item) => ({
              key: item.key,
              label: item.resolvedLabel,
              description:
                item.lifecycle.feedback ??
                item.disabledReason ??
                item.action?.description,
              action: item.action,
              tone: item.resolvedPriority === "danger" ? "destructive" : "neutral",
              disabled: item.lifecycle.disabled,
              disabledReason: item.disabledReason,
              separatorBefore: false,
            }))}
          />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {actionBar.overflow.triggerLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {overflow.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    disabled={item.lifecycle.disabled}
                    title={item.disabledReason}
                    aria-describedby={item.lifecycle.feedback ? `${item.key}-feedback` : undefined}
                    data-metadata-ui-action-state={item.lifecycle.state}
                    variant={item.resolvedPriority === "danger" ? "destructive" : "default"}
                  >
                    {item.resolvedLabel}
                    {item.lifecycle.feedback ? (
                      <span id={`${item.key}-feedback`} className="sr-only">
                        {item.lifecycle.feedback}
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      ) : null}
    </div>
  );
}

export default MetadataUiActionBarRenderer;
