import type { ReactNode } from "react";
import { trace } from "@opentelemetry/api";

import {
  GovernedEmpty,
} from "./gov-governed-empty";
import {
  parseGovernedComponentData,
  type GovernedComponent,
} from "./gov-component-schema";

import { governedDispatchErrorCopy } from "./gov-governed-renderer-copy-shared";
import { extractGovernedConfigurationDataNature } from "./governed-configuration.shared";
import { emitGovernedTelemetry } from "./gov-governed-telemetry-shared";
import { renderGovernedRendererById } from "./gov-governed-renderer-dispatch";
import {
  AFENDA_GOVERNED_COMPONENT_REGISTRY,
  AFENDA_GOVERNED_RENDERER_CONTRACTS,
  type AfendaGovernedComponentRegistry,
  type AfendaGovernedRendererId,
  type GovernedComponentRendererDiagnostics,
} from "./gov-registry";

export type GovernedComponentTreeProps = {
  component: unknown;
  registry?: AfendaGovernedComponentRegistry;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

/**
 * Core governed metadata tree.
 *
 * Boundary:
 * - validates governed component envelope
 * - resolves component type to renderer id
 * - validates dataNature against renderer contract (ADR-0025 §3)
 * - dispatches recursive rendering
 *
 * Error boundary belongs above this layer (wired inside renderGovernedRendererById).
 */
export function GovernedComponentTree({
  component,
  registry = AFENDA_GOVERNED_COMPONENT_REGISTRY,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: GovernedComponentTreeProps): ReactNode {
  const parsed = parseGovernedComponentData(component);

  if (!parsed.success) {
    recordGovernedDispatchSpan({
      rendererId: "(unknown)",
      componentType: "(unknown)",
      serverType: "(unknown)",
      dataNature: undefined,
      surfaceKey,
      sectionKey,
      componentKey,
      validation: "parse_failed",
    });
    const copy = governedDispatchErrorCopy(
      diagnostics,
      "parseFailed",
      "The governed component payload failed validation.",
    );
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }

  const data: GovernedComponent = parsed.data;
  // Registry lookup is safe when a component type has no renderer mapping.
  const rendererId = (
    registry as Readonly<Record<string, AfendaGovernedRendererId | undefined>>
  )[data.type];

  if (!rendererId) {
    recordGovernedDispatchSpan({
      rendererId: "(unregistered)",
      componentType: data.type,
      serverType: data.serverType,
      dataNature: extractGovernedConfigurationDataNature(data.configuration),
      surfaceKey,
      sectionKey,
      componentKey,
      validation: "unregistered",
    });
    const copy = governedDispatchErrorCopy(
      diagnostics,
      "unregistered",
      `No renderer registered for type "${data.type}".`,
    );
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }

  // ADR-0025 §3 — validate dataNature against renderer contract before dispatch.
  // Container-only renderers (section, stack, empty) have acceptedNatures: [] and skip this check.
  const contract: (typeof AFENDA_GOVERNED_RENDERER_CONTRACTS)[AfendaGovernedRendererId] =
    AFENDA_GOVERNED_RENDERER_CONTRACTS[rendererId];
  if (contract.acceptedNatures.length > 0) {
    const dataNature = extractGovernedConfigurationDataNature(data.configuration);

    if (dataNature === undefined) {
      // Missing dataNature on a renderer that requires one is a contract violation.
      emitGovernedTelemetry({
        name: "governed.data_nature_mismatch",
        type: data.type,
        rendererId,
        observed: "(missing)",
        accepted: contract.acceptedNatures,
        surfaceKey,
        sectionKey,
        componentKey,
      });
      recordGovernedDispatchSpan({
        rendererId,
        componentType: data.type,
        serverType: data.serverType,
        dataNature: undefined,
        surfaceKey,
        sectionKey,
        componentKey,
        validation: "nature_mismatch",
      });
      const copy = governedDispatchErrorCopy(
        diagnostics,
        "natureMismatch",
        `Renderer "${rendererId}" requires dataNature (accepted: ${contract.acceptedNatures.join(", ")}) but none was provided.`,
      );
      return (
        <GovernedEmpty
          model={{
            variant: "error",
            title: copy.title,
            description: copy.description,
          }}
        />
      );
    }

    if (!(contract.acceptedNatures as readonly string[]).includes(dataNature)) {
      emitGovernedTelemetry({
        name: "governed.data_nature_mismatch",
        type: data.type,
        rendererId,
        observed: dataNature,
        accepted: contract.acceptedNatures,
        surfaceKey,
        sectionKey,
        componentKey,
      });
      recordGovernedDispatchSpan({
        rendererId,
        componentType: data.type,
        serverType: data.serverType,
        dataNature,
        surfaceKey,
        sectionKey,
        componentKey,
        validation: "nature_mismatch",
      });
      const copy = governedDispatchErrorCopy(
        diagnostics,
        "natureMismatch",
        `Renderer "${rendererId}" does not accept dataNature "${dataNature}". Accepted: ${contract.acceptedNatures.join(", ")}.`,
      );
      return (
        <GovernedEmpty
          model={{
            variant: "error",
            title: copy.title,
            description: copy.description,
          }}
        />
      );
    }
  }

  recordGovernedDispatchSpan({
    rendererId,
    componentType: data.type,
    serverType: data.serverType,
    dataNature: extractGovernedConfigurationDataNature(data.configuration),
    surfaceKey,
    sectionKey,
    componentKey,
    validation: "ok",
  });

  return renderGovernedRendererById({
    rendererId,
    componentType: data.type,
    configuration: data.configuration,
    diagnostics,
    surfaceKey,
    sectionKey,
    componentKey,
  });
}

function recordGovernedDispatchSpan(input: {
  rendererId: string;
  componentType: string;
  serverType: string;
  dataNature: string | undefined;
  surfaceKey: string | undefined;
  sectionKey: string | undefined;
  componentKey: string | undefined;
  validation: "ok" | "parse_failed" | "nature_mismatch" | "unregistered";
}) {
  if (typeof window !== "undefined") return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const tracer = trace.getTracer("afenda-vercel");
  const span = tracer.startSpan("governed.component.dispatch");
  span.setAttribute("governed.renderer_id", input.rendererId);
  span.setAttribute("governed.component_type", input.componentType);
  span.setAttribute("governed.server_type", input.serverType);
  span.setAttribute("governed.validation", input.validation);
  if (input.dataNature) {
    span.setAttribute("governed.data_nature", input.dataNature);
  }
  if (input.surfaceKey) {
    span.setAttribute("governed.surface_key", input.surfaceKey);
  }
  if (input.sectionKey) {
    span.setAttribute("governed.section_key", input.sectionKey);
  }
  if (input.componentKey) {
    span.setAttribute("governed.component_key", input.componentKey);
  }
  span.end();
}
