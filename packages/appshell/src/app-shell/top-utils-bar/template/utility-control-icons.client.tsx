"use client";

import { CircleHelp, Grid3X3, Search, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@afenda/ui";

import { AppShellUtilityTriggerTooltip } from "./utility-trigger-tooltip.client";
import { APP_SHELL_UTILITY_ICON_BUTTON_CLASS } from "./utility-chrome.shared";

function IconButton({
  ariaLabel,
  tooltip,
  children,
  href,
}: {
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
  href?: string;
}) {
  const content = href ? (
    <Button
      aria-label={ariaLabel}
      asChild
      className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
      size="icon-sm"
      variant="outline"
    >
      <Link href={href}>{children}</Link>
    </Button>
  ) : (
    <Button
      aria-label={ariaLabel}
      className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );

  return <AppShellUtilityTriggerTooltip label={tooltip}>{content}</AppShellUtilityTriggerTooltip>;
}

export function AppShellHelpIcon({
  ariaLabel,
  tooltip,
  href,
}: {
  ariaLabel: string;
  tooltip: string;
  href: string;
}) {
  return (
    <IconButton ariaLabel={ariaLabel} href={href} tooltip={tooltip}>
      <CircleHelp aria-hidden="true" size={16} />
    </IconButton>
  );
}

export function AppShellSearchMobileIcon({
  ariaLabel,
  tooltip,
  onClickAction,
}: {
  ariaLabel: string;
  tooltip: string;
  onClickAction: () => void;
}) {
  return (
    <AppShellUtilityTriggerTooltip label={tooltip}>
      <Button
        aria-label={ariaLabel}
        className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
        size="icon-sm"
        onClick={onClickAction}
        type="button"
        variant="outline"
      >
        <Search aria-hidden="true" size={16} />
      </Button>
    </AppShellUtilityTriggerTooltip>
  );
}

export function AppShellAvatarDisc({
  ariaLabel,
  tooltip,
  onClickAction,
}: {
  ariaLabel: string;
  tooltip: string;
  onClickAction?: () => void;
}) {
  return (
    <AppShellUtilityTriggerTooltip label={tooltip}>
      <Button
        aria-label={ariaLabel}
        className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
        size="icon-sm"
        onClick={onClickAction}
        type="button"
        variant="outline"
      >
        <UserRound aria-hidden="true" size={16} />
      </Button>
    </AppShellUtilityTriggerTooltip>
  );
}

export function AppShellAppLauncherTrigger({
  ariaLabel,
  tooltip,
}: {
  ariaLabel: string;
  tooltip: string;
}) {
  return (
    <IconButton ariaLabel={ariaLabel} tooltip={tooltip}>
      <Grid3X3 aria-hidden="true" size={16} />
    </IconButton>
  );
}
