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

const variantClassName: Record<EmptyState["variant"], string> = {
  muted: "border-dashed border-border bg-transparent",
  cta: cn(
    "border-solid border-border bg-card",
    ui.radius.card,
    ui.elevation.card,
  ),
  forbidden: cn(
    "border-solid border-border bg-muted/30",
    ui.radius.card,
    ui.elevation.card,
  ),
  error: cn(
    "border-solid border-critical/40 bg-critical/5",
    ui.radius.card,
  ),
};

export function GovernedEmpty({ model, className, testId }: GovernedEmptyProps) {
  return (
    <Empty
      className={cn(
        "border p-8 text-center @sm:p-10",
        variantClassName[model.variant],
        className,
      )}
      {...(model.emptyId ? { "data-empty-id": model.emptyId } : {})}
      data-testid={
        testId ??
        (model.emptyId
          ? governedTestId("empty", model.emptyId)
          : undefined)
      }
    >
      <EmptyTitle>{model.title}</EmptyTitle>
      {model.description ? (
        <EmptyDescription>{model.description}</EmptyDescription>
      ) : null}
      {model.cta ? (
        <Button variant="secondary" size="sm" asChild>
          <Link href={asGovernedRoute(model.cta.href)} prefetch={false}>
            {model.cta.label}
          </Link>
        </Button>
      ) : null}
    </Empty>
  );
}
