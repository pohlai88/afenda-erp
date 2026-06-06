import "server-only";

import { Fragment, type ReactNode } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiActionContract } from "../contracts/action.contract";
import { resolveMetadataUiActionLifecycle } from "../server-actions/action-lifecycle.shared";

export type MetadataUiPrimitiveActionMenuItem = Readonly<
  | {
      kind?: "item";
      key: string;
      label: ReactNode;
      description?: ReactNode;
      action?: MetadataUiActionContract;
      href?: string;
      target?: "_blank";
      tone?: "neutral" | "destructive";
      shortcut?: ReactNode;
      disabled?: boolean;
      disabledReason?: string;
      separatorBefore?: boolean;
    }
  | {
      kind: "separator";
      key: string;
    }
>;

export type MetadataUiPrimitiveActionMenuProps = Readonly<{
  items: readonly MetadataUiPrimitiveActionMenuItem[];
  title?: ReactNode;
  triggerLabel?: ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}>;

function resolveMetadataUiActionMenuItemHref(
  item: Extract<MetadataUiPrimitiveActionMenuItem, { kind?: "item" }>,
): string | undefined {
  if (item.href) {
    return item.href;
  }

  if (
    item.action?.execution.kind === "navigation" ||
    item.action?.execution.kind === "external-link"
  ) {
    return item.action.execution.href;
  }

  return undefined;
}

export function MetadataUiPrimitiveActionMenu({
  items,
  title,
  triggerLabel = "More actions",
  className,
  triggerClassName,
  contentClassName,
}: MetadataUiPrimitiveActionMenuProps) {
  return (
    <div className={className} data-metadata-ui-action-menu="true">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("shrink-0", triggerClassName)}
            aria-label={typeof triggerLabel === "string" ? triggerLabel : undefined}
            aria-haspopup="menu"
          >
            <span aria-hidden="true">···</span>
            <span className="sr-only">{triggerLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("min-w-56", contentClassName)}
          data-metadata-ui-action-menu-content="true"
        >
          {title ? <DropdownMenuLabel>{title}</DropdownMenuLabel> : null}
          {items.map((item) => {
            if (item.kind === "separator") {
              return <DropdownMenuSeparator key={item.key} />;
            }

            const href = resolveMetadataUiActionMenuItemHref(item);
            const lifecycle = item.action
              ? resolveMetadataUiActionLifecycle(item.action, {
                  state: "idle",
                  disabled: item.disabled,
                  disabledReason: item.disabledReason,
                })
              : undefined;
            const isDisabled = Boolean(
              item.disabled || lifecycle?.disabled || (!href && !item.action),
            );
            const target =
              item.target ??
              (item.action?.execution.kind === "external-link" ? "_blank" : undefined);

            const itemContent = (
              <span
                className={cn(
                  "min-w-0 flex-1 text-left",
                  item.tone === "destructive" ? "text-destructive" : undefined,
                )}
              >
                {item.label}
                {item.description ? (
                  <span className={cn("mt-0.5 block text-xs", ui.color.ink.muted)}>
                    {item.description}
                  </span>
                ) : null}
              </span>
            );

            return (
              <Fragment key={item.key}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                {href ? (
                  <DropdownMenuItem
                    asChild
                    disabled={isDisabled}
                    data-variant={item.tone === "destructive" ? "destructive" : "default"}
                  >
                    <a
                      href={href}
                      target={target}
                      rel={target === "_blank" ? "noreferrer noopener" : undefined}
                    >
                      {itemContent}
                      {item.shortcut ? <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut> : null}
                    </a>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    disabled={isDisabled}
                    variant={item.tone === "destructive" ? "destructive" : "default"}
                    title={lifecycle?.disabledReason ?? item.disabledReason}
                  >
                    {itemContent}
                    {item.shortcut ? <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut> : null}
                  </DropdownMenuItem>
                )}
              </Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
