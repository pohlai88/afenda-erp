import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card";
import { cn } from "@afenda/ui/utils";

import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import type { EmptyState } from "../schemas/list-surface.schema";
import { densityGapClass } from "../schemas/surface-chrome.classes";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";
import { GovernedEmpty } from "./governed-empty";
import type { GovernedPatternSectionDensity } from "./governed-pattern-section-shell.shared";

export type GovernedSectionEmptyModel = EmptyState & { emptyId?: string };

/** Section body contract — one Card shell, one state path (ADR-0026 Pattern C recipe). */
export type GovernedSurfaceSectionCardBody =
  | { state: "forbidden"; model: GovernedSectionEmptyModel }
  | { state: "invalid"; model: GovernedSectionEmptyModel }
  | { state: "empty"; children: ReactNode }
  | { state: "ready"; children: ReactNode };

export type GovernedSurfaceSectionCardProps = {
  title: string;
  description?: string;
  body: GovernedSurfaceSectionCardBody;
  headerAction?: ReactNode;
  density?: GovernedPatternSectionDensity;
  className?: string;
  contentClassName?: string;
  sectionKey?: string;
  surfaceKey?: string;
  testId?: string;
};

export function GovernedSurfaceSectionCard({
  title,
  description,
  body,
  headerAction,
  density = "comfortable",
  className,
  contentClassName,
  sectionKey,
  surfaceKey,
  testId,
}: GovernedSurfaceSectionCardProps) {
  const renderState: GovernedRenderableState = body.state;
  const resolvedSectionKey = sectionKey ?? surfaceKey;

  const contractAttrs = resolvedSectionKey
    ? {
        ...governedIdentityAttributes({
          surfaceKey,
          sectionKey: resolvedSectionKey,
          componentKey: resolvedSectionKey,
        }),
        ...diagnosticsDataAttributes({
          state: renderState,
          testId,
        }),
      }
    : {};

  return (
    <Card
      size={density === "compact" ? "sm" : "default"}
      className={cn("mt-surface-2xl border-solid border-border", className)}
      {...contractAttrs}
    >
      <CardHeader>
        <CardTitle className="type-subtitle">{title}</CardTitle>

        {description ? <CardDescription>{description}</CardDescription> : null}

        {headerAction ? <CardAction>{headerAction}</CardAction> : null}
      </CardHeader>

      <CardContent className={cn(densityGapClass(density), contentClassName)}>
        {body.state === "forbidden" || body.state === "invalid" ? (
          <GovernedEmpty model={body.model} />
        ) : (
          body.children
        )}
      </CardContent>
    </Card>
  );
}
