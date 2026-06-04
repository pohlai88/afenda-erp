import "server-only";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@afenda/ui";
import { type ButtonSize, type ButtonVariant, ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiActionContract,
  MetadataUiActionLifecycleState,
  MetadataUiActionRisk,
  MetadataUiActionTone,
} from "../contracts/action.contract";
import type { MetadataUiActionBarItemPriority } from "../schemas/action-bar.schema";
import { resolveMetadataUiActionLifecycle } from "../server-actions/action-lifecycle.shared";

export type MetadataUiPrimitiveActionButtonState =
  | MetadataUiActionLifecycleState
  | "disabled";

export type MetadataUiPrimitiveActionButtonProps = Readonly<{
  action?: MetadataUiActionContract;
  label?: ReactNode;
  priority?: MetadataUiActionBarItemPriority;
  tone?: MetadataUiActionTone;
  risk?: MetadataUiActionRisk;
  state?: MetadataUiPrimitiveActionButtonState;
  disabledReason?: string;
  testId?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
}>;

const BUTTON_VARIANT_BY_PRIORITY = {
  primary: "default",
  secondary: "secondary",
  tertiary: "ghost",
  danger: "destructive",
} as const satisfies Record<MetadataUiActionBarItemPriority, ButtonVariant>;

const BUTTON_VARIANT_BY_TONE = {
  neutral: "secondary",
  primary: "default",
  positive: "default",
  warning: "outline",
  critical: "destructive",
} as const satisfies Record<MetadataUiActionTone, ButtonVariant>;

function resolveMetadataUiActionButtonVariant(input: {
  priority?: MetadataUiActionBarItemPriority;
  tone?: MetadataUiActionTone;
  risk?: MetadataUiActionRisk;
}): ButtonVariant {
  if (input.risk === "critical" || input.risk === "high") {
    return "destructive";
  }

  if (input.priority) {
    return BUTTON_VARIANT_BY_PRIORITY[input.priority];
  }

  if (input.tone) {
    return BUTTON_VARIANT_BY_TONE[input.tone];
  }

  return "secondary";
}

function resolveMetadataUiActionButtonSize(
  priority?: MetadataUiActionBarItemPriority,
): ButtonSize {
  return priority === "tertiary" ? "sm" : "default";
}

function resolveMetadataUiActionHref(
  action: MetadataUiActionContract | undefined,
): string | undefined {
  if (
    action?.execution.kind === "navigation" ||
    action?.execution.kind === "external-link"
  ) {
    return action.execution.href;
  }

  return undefined;
}

function requiresMetadataUiActionConfirmation(
  action: MetadataUiActionContract | undefined,
): action is MetadataUiActionContract & {
  confirmation: NonNullable<MetadataUiActionContract["confirmation"]>;
} {
  return Boolean(action?.confirmation);
}

export function MetadataUiPrimitiveActionButton({
  action,
  label,
  priority,
  tone,
  risk,
  state = "idle",
  disabledReason,
  testId,
  iconStart,
  iconEnd,
  className,
}: MetadataUiPrimitiveActionButtonProps) {
  const lifecycle = resolveMetadataUiActionLifecycle(action, {
    state: state === "disabled" ? undefined : state,
    disabled: state === "disabled",
    disabledReason,
  });
  const resolvedTone = tone ?? action?.tone;
  const resolvedRisk = risk ?? action?.risk;
  const resolvedLabel = label ?? action?.label ?? action?.id ?? "Action";
  const resolvedDisabledReason = lifecycle.disabledReason;
  const disabledReasonId = resolvedDisabledReason
    ? `${action?.id ?? testId ?? "metadata-ui-action"}-disabled-reason`
    : undefined;
  const feedbackId = lifecycle.feedback
    ? `${action?.id ?? testId ?? "metadata-ui-action"}-lifecycle-feedback`
    : undefined;
  if (action?.visibility === "hidden") {
    return null;
  }

  const isDisabled = lifecycle.disabled;
  const href = resolveMetadataUiActionHref(action);
  const variant = resolveMetadataUiActionButtonVariant({
    priority,
    tone: resolvedTone,
    risk: resolvedRisk,
  });
  const size = resolveMetadataUiActionButtonSize(priority);
  const commonProps = {
    "aria-disabled": isDisabled || undefined,
    "aria-describedby": [disabledReasonId, feedbackId]
      .filter(Boolean)
      .join(" ") || undefined,
    "data-metadata-ui-action-state": lifecycle.state,
    "data-testid": testId,
    title: resolvedDisabledReason,
    className: cn(ui.focus.default, className),
  };
  const content = (
    <>
      {iconStart ? <span data-icon="inline-start">{iconStart}</span> : null}
      <span>{resolvedLabel}</span>
      {lifecycle.state === "pending" ? <span>{String.fromCharCode(8230)}</span> : null}
      {lifecycle.label && lifecycle.state !== "pending" ? (
        <span className="sr-only">{lifecycle.label}</span>
      ) : null}
      {iconEnd ? <span data-icon="inline-end">{iconEnd}</span> : null}
    </>
  );
  const disabledReasonNode = disabledReasonId ? (
    <span id={disabledReasonId} className="sr-only">
      {resolvedDisabledReason}
    </span>
  ) : null;
  const feedbackNode = feedbackId ? (
    <span
      id={feedbackId}
      className="sr-only"
      aria-live={lifecycle.liveRegion === "off" ? undefined : lifecycle.liveRegion}
    >
      {lifecycle.feedback}
    </span>
  ) : null;
  const confirmationDescription =
    action?.confirmation?.description ??
    "Confirm this action only if you understand the effect. This operation may be irreversible.";

  if (requiresMetadataUiActionConfirmation(action) && !isDisabled) {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant={variant}
              size={size}
              {...commonProps}
            >
              {content}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action.confirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmationDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {action.confirmation.cancelLabel}
              </AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                {action.confirmation.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {disabledReasonNode}
        {feedbackNode}
      </>
    );
  }

  if (href && !isDisabled) {
    const target =
      action?.execution.kind === "external-link" ||
      (action?.execution.kind === "navigation" &&
        action.execution.target === "new-tab")
        ? "_blank"
        : undefined;

    return (
      <>
        <Button
          asChild
          variant={variant}
          size={size}
          {...commonProps}
        >
          <a
            href={href}
            target={target}
            rel={target === "_blank" ? "noreferrer" : undefined}
          >
            {content}
          </a>
        </Button>
        {disabledReasonNode}
        {feedbackNode}
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        disabled={isDisabled}
        variant={variant}
        size={size}
        {...commonProps}
      >
        {content}
      </Button>
      {disabledReasonNode}
      {feedbackNode}
    </>
  );
}
