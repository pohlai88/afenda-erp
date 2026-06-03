"use client";

import { CircleHelp, Grid3X3, Search, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppShellUtilityTriggerTooltip } from "./app-utility-trigger-tooltip-client";
import { APP_SHELL_UTILITY_ICON_BUTTON_CLASS } from "./app-utility-chrome-shared";

function IconButton({
  ariaLabel,
  tooltip,
  children,
  href,
  onClick,
}: {
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = href ? (
    <Link
      aria-label={ariaLabel}
      className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
      href={href}
    >
      {children}
    </Link>
  ) : (
    <button
      aria-label={ariaLabel}
      className={APP_SHELL_UTILITY_ICON_BUTTON_CLASS}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
    <IconButton
      ariaLabel={ariaLabel}
      onClick={onClickAction}
      tooltip={tooltip}
    >
      <Search aria-hidden="true" size={16} />
    </IconButton>
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
    <IconButton ariaLabel={ariaLabel} onClick={onClickAction} tooltip={tooltip}>
      <UserRound aria-hidden="true" size={16} />
    </IconButton>
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
