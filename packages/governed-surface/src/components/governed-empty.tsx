import Link from "next/link";

import { Button } from "@afenda/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@afenda/ui/empty";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { EmptyState } from "../schemas/list-surface.schema";
import { governedTestId } from "../utils/governed-identity.shared";
import { asGovernedRoute } from "../utils/governed-safe-route";

export type GovernedEmptyProps = {
  model: EmptyState & {
    emptyId?: string;
  };
  className?: string;
  testId?: string;
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

export function GovernedEmpty({ model, className, testId }: GovernedEmptyProps) {
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
      data-testid={resolvedTestId}
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
