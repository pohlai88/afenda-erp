import Link from "next/link";

import { Button } from "@afenda/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@afenda/ui/empty";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { EmptyState } from "./gov-list-surface-schema";
import type { GovernedRenderableState } from "./gov-governed-component-state-schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "../utils/governed-identity.shared";
import { asGovernedRoute } from "../utils/governed-safe-route";

export type GovernedEmptyProps = {
  model: EmptyState & {
    emptyId?: string;
  };
  className?: string;
  testId?: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  renderState?: GovernedRenderableState;
};

const variantClassName = {
  muted: "border-dashed border-border bg-transparent",
  cta: cn("border-solid border-border bg-card", ui.radius.card, ui.elevation.card),
  forbidden: cn(
    "border-solid border-border bg-muted/30",
    ui.radius.card,
    ui.elevation.card,
  ),
  error: cn(
    "border-solid border-critical/40 bg-critical/5",
    ui.radius.card,
  ),
} satisfies Record<EmptyState["variant"], string>;

const variantRole = {
  muted: undefined,
  cta: undefined,
  forbidden: "status",
  error: "alert",
} satisfies Record<EmptyState["variant"], "status" | "alert" | undefined>;

export function GovernedEmpty({
  model,
  className,
  testId,
  surfaceKey,
  sectionKey,
  componentKey = model.emptyId,
  renderState = model.variant === "error"
    ? "invalid"
    : model.variant === "forbidden"
      ? "forbidden"
      : "empty",
}: GovernedEmptyProps) {
  const resolvedTestId =
    testId ??
    (model.emptyId ? governedTestId("empty", model.emptyId) : undefined);

  const ctaHref = model.cta?.href
    ? asGovernedRoute(model.cta.href)
    : undefined;

  return (
    <Empty
      role={variantRole[model.variant]}
      className={cn(
        "border p-8 text-center @sm:p-10",
        variantClassName[model.variant],
        className,
      )}
      data-empty-id={model.emptyId}
      data-empty-variant={model.variant}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: resolvedTestId,
      })}
    >
      <EmptyTitle>{model.title}</EmptyTitle>

      {model.description ? (
        <EmptyDescription>{model.description}</EmptyDescription>
      ) : null}

      {model.cta && ctaHref ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={ctaHref} prefetch={false}>
            {model.cta.label}
          </Link>
        </Button>
      ) : null}
    </Empty>
  );
}
