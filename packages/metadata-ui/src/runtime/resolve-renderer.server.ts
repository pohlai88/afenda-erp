import "server-only";

import type { MetadataUiRendererContract } from "../contracts/renderer.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import {
  getMetadataUiSectionCapabilities,
  type MetadataUiSectionCapability,
} from "../registry/section-capability-registry.server";
import {
  resolveMetadataUiServerRendererForSectionKind,
  type MetadataUiRegisteredServerSectionKind,
} from "../registry/renderer-registry.server";
import {
  createMetadataUiRuntimeDiagnostic,
  type MetadataUiRuntimeResolutionDiagnostics,
} from "./runtime-diagnostics.shared";
import { MetadataUiRuntimeError } from "./runtime-error.shared";
import { assertMetadataUiRuntimeSectionRegistered } from "./resolve-runtime.shared";

export type MetadataUiServerRendererResolution<
  SectionKind extends MetadataUiSectionKind = MetadataUiSectionKind,
> = Readonly<{
  runtime: "server";
  sectionKind: SectionKind;
  renderer: MetadataUiRendererContract;
  capabilities: readonly MetadataUiSectionCapability[];
  registeredSectionKind: Extract<
    MetadataUiRegisteredServerSectionKind,
    SectionKind
  >;
}>;

export function resolveMetadataUiRuntimeRendererForSectionKind<
  const SectionKind extends MetadataUiSectionKind,
>(sectionKind: SectionKind): MetadataUiServerRendererResolution<SectionKind> {
  assertMetadataUiRuntimeSectionRegistered(sectionKind);

  const renderer =
    resolveMetadataUiServerRendererForSectionKind(sectionKind);

  if (!renderer) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.renderer-not-registered",
      `Metadata UI server renderer for section "${sectionKind}" is not registered.`,
      { runtime: "server", sectionKind },
    );
  }

  if (renderer.runtime !== "server") {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.invalid-renderer",
      `Metadata UI renderer "${renderer.id}" must use server runtime.`,
      {
        runtime: renderer.runtime,
        expectedRuntime: "server",
        rendererId: renderer.id,
        sectionKind,
      },
    );
  }

  return {
    runtime: "server",
    sectionKind,
    renderer,
    capabilities: getMetadataUiSectionCapabilities(sectionKind),
    registeredSectionKind: renderer.sectionKind as Extract<
      MetadataUiRegisteredServerSectionKind,
      SectionKind
    >,
  };
}

export function safeResolveMetadataUiRuntimeRendererForSectionKind(
  sectionKind: MetadataUiSectionKind,
): MetadataUiRuntimeResolutionDiagnostics {
  try {
    const resolution =
      resolveMetadataUiRuntimeRendererForSectionKind(sectionKind);

    return {
      state:
        resolution.renderer.lifecycle === "deprecated"
          ? "invalid"
          : "ready",
      runtime: "server",
      sectionKind,
      renderer: resolution.renderer,
      diagnostics: [
        createMetadataUiRuntimeDiagnostic({
          source: "runtime-resolution",
          state: "ready",
          runtime: "server",
          sectionKind,
          rendererId: resolution.renderer.id,
          message: `Resolved Metadata UI renderer "${resolution.renderer.id}".`,
        }),
      ],
    };
  } catch (error) {
    const runtimeError =
      error instanceof MetadataUiRuntimeError
        ? error
        : new MetadataUiRuntimeError(
            "metadata-ui.runtime.invalid-renderer",
            error instanceof Error ? error.message : "Unknown renderer error.",
            { runtime: "server", sectionKind },
          );

    return {
      state: "error",
      runtime: "server",
      sectionKind,
      diagnostics: [
        {
          source: "runtime-resolution",
          state: "error",
          runtime: "server",
          sectionKind,
          rendererId: runtimeError.context.rendererId,
          componentId: runtimeError.context.componentId,
          message: runtimeError.message,
          error: runtimeError.toJSON(),
        },
      ],
    };
  }
}
