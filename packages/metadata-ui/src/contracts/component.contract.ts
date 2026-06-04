import { z } from "zod";

import {
  METADATA_UI_ACTION_KEY_SCHEMA,
  metadataUiActionContractSchema,
} from "./action.contract";
import type { MetadataUiActionContract } from "./action.contract";

/**
 * Runtime-neutral component contract.
 *
 * Describes registry metadata for renderable components — not React implementations,
 * server modules, ERP repositories, or feature-domain logic.
 *
 * `capabilities` declare what a component may do at the platform layer;
 * they do not encode business permissions or workflow outcomes.
 */

export const METADATA_UI_COMPONENT_CONTRACT_SCHEMA_ID =
  "metadata-ui.component.contract" as const;

export const METADATA_UI_COMPONENT_CONTRACT_SCHEMA_VERSION = 1 as const;

export type MetadataUiComponentContractSchemaStability = "beta";

export const METADATA_UI_COMPONENT_CONTRACT_SCHEMA_STABILITY: MetadataUiComponentContractSchemaStability =
  "beta";

const METADATA_UI_COMPONENT_RUNTIME_VALUES = [
  "shared",
  "server",
  "client",
] as const;

const METADATA_UI_COMPONENT_KIND_VALUES = [
  "section",
  "primitive",
  "renderer",
  "shell",
  "client-island",
] as const;

const METADATA_UI_COMPONENT_STABILITY_VALUES = [
  "stable",
  "experimental",
  "deprecated",
] as const;

const METADATA_UI_COMPONENT_LIFECYCLE_VALUES = [
  "active",
  "internal",
  "deprecated",
  "removed",
] as const;

const METADATA_UI_COMPONENT_CAPABILITY_VALUES = [
  "render",
  "compose",
  "interact",
  "navigate",
  "submit",
  "display-empty",
  "display-error",
  "display-loading",
  "display-forbidden",
] as const;

const METADATA_UI_ACCESSIBILITY_LANDMARK_ROLE_VALUES = [
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
] as const;

/** Component and renderer registry ids share action-key formatting. */
export const metadataUiComponentIdSchema =
  METADATA_UI_ACTION_KEY_SCHEMA.max(120);

const metadataUiComponentRuntimeSchema = z.enum(
  METADATA_UI_COMPONENT_RUNTIME_VALUES,
);

export const metadataUiComponentKindSchema = z.enum(
  METADATA_UI_COMPONENT_KIND_VALUES,
);

export const metadataUiComponentStabilitySchema = z.enum(
  METADATA_UI_COMPONENT_STABILITY_VALUES,
);

export const metadataUiComponentLifecycleSchema = z.enum(
  METADATA_UI_COMPONENT_LIFECYCLE_VALUES,
);

export const metadataUiComponentCapabilitySchema = z.enum(
  METADATA_UI_COMPONENT_CAPABILITY_VALUES,
);

const metadataUiAccessibilityLandmarkRoleSchema = z.enum(
  METADATA_UI_ACCESSIBILITY_LANDMARK_ROLE_VALUES,
);

export const metadataUiComponentDiagnosticsSchema = z
  .object({
    testIdPrefix: z.string().trim().min(1).max(80).optional(),
    emitsRenderLog: z.boolean().default(false),
    exposesDomIdentity: z.boolean().default(true),
  })
  .strict();

export const metadataUiComponentAccessibilitySchema = z
  .object({
    requiresLabel: z.boolean().default(false),
    requiresDescription: z.boolean().default(false),
    landmarkRole: metadataUiAccessibilityLandmarkRoleSchema.optional(),
  })
  .strict();

export const metadataUiComponentContractSchema = z
  .object({
    schemaId: z
      .literal(METADATA_UI_COMPONENT_CONTRACT_SCHEMA_ID)
      .default(METADATA_UI_COMPONENT_CONTRACT_SCHEMA_ID),
    schemaVersion: z
      .literal(METADATA_UI_COMPONENT_CONTRACT_SCHEMA_VERSION)
      .default(METADATA_UI_COMPONENT_CONTRACT_SCHEMA_VERSION),

    id: metadataUiComponentIdSchema,
    kind: metadataUiComponentKindSchema,
    runtime: metadataUiComponentRuntimeSchema,

    label: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(240).optional(),

    stability: metadataUiComponentStabilitySchema.default("stable"),
    lifecycle: metadataUiComponentLifecycleSchema.default("active"),

    capabilities: z
      .array(metadataUiComponentCapabilitySchema)
      .min(1)
      .max(16)
      .default(["render"]),

    supportedActions: z
      .array(metadataUiActionContractSchema)
      .max(32)
      .default([]),

    diagnostics: metadataUiComponentDiagnosticsSchema.optional(),
    accessibility: metadataUiComponentAccessibilitySchema.optional(),

    rendererId: METADATA_UI_ACTION_KEY_SCHEMA.optional(),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((component, ctx) => {
    const uniqueCapabilities = new Set(component.capabilities);
    if (uniqueCapabilities.size !== component.capabilities.length) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message: "Capabilities must be unique.",
      });
    }

    const actionIds = component.supportedActions.map((action) => action.id);
    if (new Set(actionIds).size !== actionIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["supportedActions"],
        message: "supportedActions ids must be unique.",
      });
    }

    const runtimeByKind: Record<
      z.infer<typeof metadataUiComponentKindSchema>,
      z.infer<typeof metadataUiComponentRuntimeSchema>
    > = {
      section: "server",
      renderer: "server",
      shell: "server",
      "client-island": "client",
      primitive: "shared",
    };

    const expectedRuntime = runtimeByKind[component.kind];
    if (component.runtime !== expectedRuntime) {
      ctx.addIssue({
        code: "custom",
        path: ["runtime"],
        message: `Component kind "${component.kind}" requires ${expectedRuntime} runtime.`,
      });
    }

    if (component.kind === "renderer" && !component.rendererId) {
      ctx.addIssue({
        code: "custom",
        path: ["rendererId"],
        message: "Renderer components must declare rendererId.",
      });
    }

    if (component.kind !== "renderer" && component.rendererId) {
      ctx.addIssue({
        code: "custom",
        path: ["rendererId"],
        message: "rendererId is only valid for renderer components.",
      });
    }

    if (
      component.lifecycle === "deprecated" &&
      component.stability !== "deprecated"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["stability"],
        message: "Deprecated lifecycle requires deprecated stability.",
      });
    }

    if (
      component.lifecycle === "removed" &&
      component.stability !== "deprecated"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["stability"],
        message: "Removed components must be marked deprecated.",
      });
    }

    if (
      component.lifecycle === "removed" &&
      component.capabilities.some(
        (capability) =>
          ![
            "display-empty",
            "display-error",
            "display-loading",
            "display-forbidden",
          ].includes(capability),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message:
          "Removed components may only declare display-* capabilities.",
      });
    }

    if (
      component.supportedActions.length > 0 &&
      !component.capabilities.includes("interact") &&
      !component.capabilities.includes("submit") &&
      !component.capabilities.includes("navigate")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message:
          "Components with supportedActions must declare interact, submit, or navigate capability.",
      });
    }

    if (
      component.capabilities.includes("interact") &&
      component.runtime === "shared"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message: "Shared runtime components cannot declare interact capability.",
      });
    }

    if (
      component.capabilities.includes("submit") &&
      component.runtime === "shared"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["capabilities"],
        message: "Shared runtime components cannot declare submit capability.",
      });
    }

    if (
      component.accessibility?.requiresDescription &&
      !component.description
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message:
          "requiresDescription accessibility gate requires component description.",
      });
    }
  });

export type MetadataUiComponentRuntime = z.infer<
  typeof metadataUiComponentRuntimeSchema
>;

export type MetadataUiComponentId = z.infer<typeof metadataUiComponentIdSchema>;

export type MetadataUiComponentKind = z.infer<
  typeof metadataUiComponentKindSchema
>;

export type MetadataUiComponentStability = z.infer<
  typeof metadataUiComponentStabilitySchema
>;

export type MetadataUiComponentLifecycle = z.infer<
  typeof metadataUiComponentLifecycleSchema
>;

export type MetadataUiComponentCapability = z.infer<
  typeof metadataUiComponentCapabilitySchema
>;

export type MetadataUiComponentDiagnostics = z.infer<
  typeof metadataUiComponentDiagnosticsSchema
>;

export type MetadataUiComponentAccessibility = z.infer<
  typeof metadataUiComponentAccessibilitySchema
>;

type MetadataUiComponentContractSchemaOutput = z.output<
  typeof metadataUiComponentContractSchema
>;

export type MetadataUiComponentContractInput = z.input<
  typeof metadataUiComponentContractSchema
>;

export type MetadataUiComponentRuntimeByKind = {
  section: "server";
  renderer: "server";
  shell: "server";
  "client-island": "client";
  primitive: "shared";
};

export type MetadataUiComponentRuntimeForKind<
  Kind extends MetadataUiComponentKind,
> = MetadataUiComponentRuntimeByKind[Kind];

export type MetadataUiComponentKindForRuntime<
  Runtime extends MetadataUiComponentRuntime,
> = {
  [Kind in MetadataUiComponentKind]: MetadataUiComponentRuntimeForKind<Kind> extends Runtime
    ? Kind
    : never;
}[MetadataUiComponentKind];

export type MetadataUiComponentActionCapability = Extract<
  MetadataUiComponentCapability,
  "interact" | "navigate" | "submit"
>;

export type MetadataUiComponentDisplayCapability = Extract<
  MetadataUiComponentCapability,
  `display-${string}`
>;

type MetadataUiNonEmptyArray<Value> = [Value, ...Value[]];

type MetadataUiComponentCapabilitiesWithAction =
  MetadataUiNonEmptyArray<MetadataUiComponentCapability>;

type MetadataUiComponentSupportedActionsState =
  | {
      supportedActions: [];
      capabilities: MetadataUiComponentCapability[];
    }
  | {
      supportedActions: MetadataUiNonEmptyArray<MetadataUiActionContract>;
      capabilities: MetadataUiComponentCapabilitiesWithAction;
    };

type MetadataUiComponentRendererState<Kind extends MetadataUiComponentKind> =
  Kind extends "renderer"
    ? {
        rendererId: string;
      }
    : {
        rendererId?: undefined;
      };

type MetadataUiComponentLifecycleState =
  | {
      lifecycle: "active" | "internal";
      stability: MetadataUiComponentStability;
      capabilities: MetadataUiComponentCapability[];
    }
  | {
      lifecycle: "deprecated";
      stability: "deprecated";
      capabilities: MetadataUiComponentCapability[];
    }
  | {
      lifecycle: "removed";
      stability: "deprecated";
      capabilities: MetadataUiComponentDisplayCapability[];
    };

type MetadataUiComponentAccessibilityState =
  | {
      accessibility?: MetadataUiComponentAccessibility & {
        requiresDescription?: false;
      };
      description?: string;
    }
  | {
      accessibility: MetadataUiComponentAccessibility & {
        requiresDescription: true;
      };
      description: string;
    };

type MetadataUiComponentRuntimeCapabilityState<
  Runtime extends MetadataUiComponentRuntime,
> = Runtime extends "shared"
  ? {
      capabilities: Exclude<
        MetadataUiComponentCapability,
        "interact" | "submit"
      >[];
    }
  : {
      capabilities: MetadataUiComponentCapability[];
    };

type MetadataUiComponentContractBase = Omit<
  MetadataUiComponentContractSchemaOutput,
  | "accessibility"
  | "capabilities"
  | "description"
  | "kind"
  | "lifecycle"
  | "rendererId"
  | "runtime"
  | "stability"
  | "supportedActions"
>;

export type MetadataUiComponentContractForKind<
  Kind extends MetadataUiComponentKind,
> = MetadataUiComponentContractBase &
  MetadataUiComponentRendererState<Kind> &
  MetadataUiComponentLifecycleState &
  MetadataUiComponentAccessibilityState &
  MetadataUiComponentSupportedActionsState &
  MetadataUiComponentRuntimeCapabilityState<
    MetadataUiComponentRuntimeForKind<Kind>
  > & {
    kind: Kind;
    runtime: MetadataUiComponentRuntimeForKind<Kind>;
  };

export type MetadataUiComponentContract = {
  [Kind in MetadataUiComponentKind]: MetadataUiComponentContractForKind<Kind>;
}[MetadataUiComponentKind];

export type MetadataUiComponentContractParseResult =
  | {
      success: true;
      data: MetadataUiComponentContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiComponentContractInvariants(
  component: MetadataUiComponentContractSchemaOutput,
): asserts component is MetadataUiComponentContract {
  const runtimeByKind = {
    section: "server",
    renderer: "server",
    shell: "server",
    "client-island": "client",
    primitive: "shared",
  } satisfies MetadataUiComponentRuntimeByKind;

  if (component.runtime !== runtimeByKind[component.kind]) {
    throw new Error(
      `Component kind "${component.kind}" requires ${runtimeByKind[component.kind]} runtime.`,
    );
  }

  if (component.kind === "renderer" && !component.rendererId) {
    throw new Error("Renderer components must declare rendererId.");
  }

  if (component.kind !== "renderer" && component.rendererId) {
    throw new Error("rendererId is only valid for renderer components.");
  }

  if (
    (component.lifecycle === "deprecated" ||
      component.lifecycle === "removed") &&
    component.stability !== "deprecated"
  ) {
    throw new Error(
      "Deprecated or removed components require deprecated stability.",
    );
  }

  if (
    component.lifecycle === "removed" &&
    component.capabilities.some(
      (capability) => !capability.startsWith("display-"),
    )
  ) {
    throw new Error(
      "Removed components may only declare display-* capabilities.",
    );
  }

  if (
    component.supportedActions.length > 0 &&
    !component.capabilities.includes("interact") &&
    !component.capabilities.includes("submit") &&
    !component.capabilities.includes("navigate")
  ) {
    throw new Error(
      "Components with supportedActions must declare interact, submit, or navigate capability.",
    );
  }

  if (
    component.runtime === "shared" &&
    (component.capabilities.includes("interact") ||
      component.capabilities.includes("submit"))
  ) {
    throw new Error(
      "Shared runtime components cannot declare interact or submit capability.",
    );
  }

  if (component.accessibility?.requiresDescription && !component.description) {
    throw new Error(
      "requiresDescription accessibility gate requires component description.",
    );
  }
}

export function parseMetadataUiComponentContract(
  input: unknown,
): MetadataUiComponentContract {
  const component = metadataUiComponentContractSchema.parse(input);
  assertMetadataUiComponentContractInvariants(component);
  return component;
}

export function safeParseMetadataUiComponentContract(
  input: unknown,
): MetadataUiComponentContractParseResult {
  const result = metadataUiComponentContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiComponentContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
