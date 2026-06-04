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

import type { GovernedRenderableState } from "./gov-governed-component-state-schema";
import type { EmptyState } from "./gov-list-surface-schema";
import { densityGapClass } from "./gov-surface-chrome-classes";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";
import { GovernedEmpty } from "./governed-empty";
import type { GovernedPatternSectionDensity } from "./governed-pattern-section-shell.shared";

export type GovernedSectionEmptyModel = EmptyState & {
  emptyId?: string;
};

export type GovernedSurfaceSectionCardBody =
  | { state: "forbidden"; model: GovernedSectionEmptyModel }
  | { state: "invalid"; model: GovernedSectionEmptyModel }
  | { state: "empty"; model: GovernedSectionEmptyModel }
  | { state: "ready"; children: ReactNode };

export type GovernedSurfaceSectionCardProps = {
  title: string;
  description?: string;
  body: GovernedSurfaceSectionCardBody;
  headerAction?: ReactNode;
  density?: GovernedPatternSectionDensity;
  className?: string;
  contentClassName?: string;

  surfaceKey: string;
  sectionKey: string;
  componentKey?: string;
};

export function GovernedSurfaceSectionCard({
  title,
  description,
  body,
  headerAction,
  density = "comfortable",
  className,
  contentClassName,
  surfaceKey,
  sectionKey,
  componentKey = sectionKey,
}: GovernedSurfaceSectionCardProps) {
  const renderState: GovernedRenderableState = body.state;
  const titleId = toGovernedDomId("section-card-title", componentKey);
  const descriptionId = description
    ? toGovernedDomId("section-card-description", componentKey)
    : undefined;

  const bodyComponentKey = `${componentKey}-body`;
  const actionComponentKey = `${componentKey}-header-action`;

  return (
    <Card
      size={density === "compact" ? "sm" : "default"}
      className={cn("mt-surface-2xl border-solid border-border", className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: governedTestId("section-card", componentKey),
      })}
    >
      <CardHeader>
        <CardTitle id={titleId} className="type-subtitle">
          {title}
        </CardTitle>

        {description ? (
          <CardDescription id={descriptionId}>{description}</CardDescription>
        ) : null}

        {headerAction ? (
          <CardAction
            {...governedIdentityAttributes({
              surfaceKey,
              sectionKey,
              componentKey: actionComponentKey,
            })}
            {...diagnosticsDataAttributes({
              state: renderState,
              testId: governedTestId("section-card-action", componentKey),
            })}
          >
            {headerAction}
          </CardAction>
        ) : null}
      </CardHeader>

      <CardContent
        className={cn(densityGapClass(density), contentClassName)}
        {...governedIdentityAttributes({
          surfaceKey,
          sectionKey,
          componentKey: bodyComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: renderState,
          testId: governedTestId("section-card-body", componentKey),
        })}
      >
        {body.state === "ready" ? (
          body.children
        ) : (
          <GovernedEmpty
            model={
              body.state === "empty"
                ? body.model
                : {
                    ...body.model,
                    variant:
                      body.state === "forbidden"
                        ? "forbidden"
                        : body.model.variant,
                  }
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
