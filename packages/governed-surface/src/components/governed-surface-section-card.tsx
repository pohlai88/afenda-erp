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

import type { EmptyState } from "../schemas/list-surface.schema";
import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import { densityGapClass } from "../schemas/surface-chrome.classes";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";
import type { GovernedPatternSectionDensity } from "./governed-pattern-section-shell.shared";
import { GovernedEmpty } from "./governed-empty";

/** Section body contract — one Card shell, one state path (ADR-0026 Pattern C recipe). */
export type GovernedSurfaceSectionCardBody =
  | { state: "forbidden"; model: EmptyState }
  | { state: "invalid"; model: EmptyState }
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
  /** When set, emits identity and diagnostics attrs on the Card root. */
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
  const renderState = body.state satisfies GovernedRenderableState;
  const contractAttrs =
    sectionKey || surfaceKey
      ? {
          ...governedIdentityAttributes({
            surfaceKey,
            sectionKey: sectionKey ?? surfaceKey,
            componentKey: sectionKey ?? surfaceKey,
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
        <CardTitle className="type-subtitle">
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {headerAction ? <CardAction>{headerAction}</CardAction> : null}
      </CardHeader>
      <CardContent
        className={cn(densityGapClass(density), contentClassName)}
      >
        {body.state === "forbidden" || body.state === "invalid" ? (
          <GovernedEmpty model={body.model} />
        ) : (
          body.children
        )}
      </CardContent>
    </Card>
  );
}
