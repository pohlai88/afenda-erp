import { GovernedEmpty } from "./gov-governed-empty";
import {
  GOVERNED_ACTION_BAR_CONFIGURATION_SCHEMA_ID,
  parseGovernedActionBarConfiguration,
} from "./gov-action-bar-schema";
import { governedParseErrorCopy } from "./gov-governed-renderer-copy-shared";
import { densityGapClass } from "./gov-surface-chrome-classes";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";
import { resolveGovernedServerAction } from "./gov-server-actions-shared";
import { Badge } from "@afenda/ui/badge";
import { cn } from "@afenda/ui/utils";

import type { RendererProps } from "./gov-governed-renderer-dispatch";

import { ActionBarActionForm } from "./gov-action-bar-action-client";

/**
 * governed:action-bar — declarative ERP action descriptors.
 */
export function ActionBarRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
  componentType = "governed:action-bar",
}: RendererProps) {
  const resolvedComponentKey =
    componentKey ?? sectionKey ?? surfaceKey ?? "action-bar";
  const parsed = parseGovernedActionBarConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(
      diagnostics,
      "actionBar",
      `${GOVERNED_ACTION_BAR_CONFIGURATION_SCHEMA_ID} failed validation.`,
    );
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
        renderState="invalid"
      />
    );
  }

  const { actions, chrome, ariaLabel } = parsed.data;
  const highAssuranceCount = actions.filter(
    (action) => action.requiresStepUp || action.confirm,
  ).length;

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel ?? "Actions"}
      className={cn(
        "@container flex flex-col",
        densityGapClass(chrome?.density),
      )}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("action-bar", resolvedComponentKey),
        componentType,
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{actions.length} actions</Badge>
          {highAssuranceCount > 0 ? (
            <Badge variant="warning">{highAssuranceCount} gated</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <ActionBarActionForm
            key={action.id}
            action={action}
            serverAction={resolveGovernedServerAction(action.id)}
          />
        ))}
      </div>
    </div>
  );
}
