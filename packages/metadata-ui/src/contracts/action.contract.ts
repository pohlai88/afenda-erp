import { z } from "zod";

/**
 * Runtime-neutral action contract.
 *
 * Describes action metadata for rendering and dispatch. Does not execute actions,
 * import UI, import server modules, or encode ERP business rules.
 *
 * `intent`, `tone`, and `risk` classify presentation, telemetry, and UX gates —
 * not approval policy, posting rules, or workflow outcomes (those live in feature packages).
 */

export const METADATA_UI_ACTION_CONTRACT_SCHEMA_ID =
  "metadata-ui.action.contract" as const;

export const METADATA_UI_ACTION_CONTRACT_SCHEMA_VERSION = 1 as const;

export type MetadataUiActionContractSchemaStability = "beta";

export const METADATA_UI_ACTION_CONTRACT_SCHEMA_STABILITY: MetadataUiActionContractSchemaStability =
  "beta";

const METADATA_UI_ACTION_KIND_VALUES = [
  "navigation",
  "server-action",
  "client-event",
  "external-link",
] as const;

const METADATA_UI_ACTION_INTENT_VALUES = [
  "create",
  "read",
  "update",
  "delete",
  "submit",
  "approve",
  "reject",
  "export",
  "import",
  "navigate",
  "open",
  "close",
  "retry",
  "custom",
] as const;

const METADATA_UI_ACTION_TONE_VALUES = [
  "neutral",
  "primary",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_ACTION_RISK_VALUES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

const METADATA_UI_ACTION_VISIBILITY_VALUES = [
  "visible",
  "disabled",
  "hidden",
] as const;

const METADATA_UI_ACTION_LIFECYCLE_STATE_VALUES = [
  "idle",
  "pending",
  "succeeded",
  "failed",
  "blocked",
] as const;

const METADATA_UI_ACTION_FEEDBACK_PLACEMENT_VALUES = [
  "inline",
  "host-outlet",
  "silent",
] as const;

const METADATA_UI_ACTION_TARGET_VALUES = [
  "self",
  "modal",
  "drawer",
  "new-tab",
  "download",
] as const;

/** Registry lookup keys and stable action ids share the same format. */
export const METADATA_UI_ACTION_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Keys must use lowercase kebab/dot notation.",
  );

const METADATA_UI_UNSAFE_HREF =
  /^(?:javascript:|data:|vbscript:)/i;

const METADATA_UI_RELATIVE_HREF = /^(\/|\.\.?\/|#)/;

export const metadataUiSafeNavigationHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .superRefine((href, ctx) => {
    if (METADATA_UI_UNSAFE_HREF.test(href)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Navigation href must not use unsafe URL schemes.",
      });
    }

    if (
      !METADATA_UI_RELATIVE_HREF.test(href) &&
      !href.startsWith("http://") &&
      !href.startsWith("https://")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Navigation href must be relative (/...), hash (#...), or http(s) URL.",
      });
    }
  });

export const metadataUiSafeExternalHrefSchema = z
  .string()
  .trim()
  .url()
  .max(500)
  .superRefine((href, ctx) => {
    if (METADATA_UI_UNSAFE_HREF.test(href)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "External links must not use unsafe URL schemes.",
      });
    }

    if (!href.startsWith("http://") && !href.startsWith("https://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "External links must use http(s) URL schemes.",
      });
    }
  });

export const metadataUiActionKindSchema = z.enum(
  METADATA_UI_ACTION_KIND_VALUES,
);

/** Presentation / telemetry classification — not domain workflow state. */
export const metadataUiActionIntentSchema = z.enum(
  METADATA_UI_ACTION_INTENT_VALUES,
);

export const metadataUiActionToneSchema = z.enum(
  METADATA_UI_ACTION_TONE_VALUES,
);

export const metadataUiActionRiskSchema = z.enum(
  METADATA_UI_ACTION_RISK_VALUES,
);

export const metadataUiActionVisibilitySchema = z.enum(
  METADATA_UI_ACTION_VISIBILITY_VALUES,
);

export const metadataUiActionLifecycleStateSchema = z.enum(
  METADATA_UI_ACTION_LIFECYCLE_STATE_VALUES,
);

export const metadataUiActionFeedbackPlacementSchema = z.enum(
  METADATA_UI_ACTION_FEEDBACK_PLACEMENT_VALUES,
);

export const metadataUiActionTargetSchema = z.enum(
  METADATA_UI_ACTION_TARGET_VALUES,
);

export const metadataUiActionIdSchema = METADATA_UI_ACTION_KEY_SCHEMA.max(120);

export const metadataUiActionLabelSchema = z.string().trim().min(1).max(80);

export const metadataUiActionDescriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(240);

/**
 * Capability gate — structured for alignment with ERP permission contracts.
 * Evaluated at build/render time in feature packages, never inside renderers here.
 */
export const metadataUiActionPermissionSchema = z
  .object({
    module: z.string().trim().min(1).max(64),
    object: z.string().trim().min(1).max(64),
    function: z.string().trim().min(1).max(64),
    reason: metadataUiActionDescriptionSchema.optional(),
  })
  .strict();

export const metadataUiActionConfirmationSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: metadataUiActionDescriptionSchema.optional(),
    confirmLabel: z.string().trim().min(1).max(80),
    cancelLabel: z.string().trim().min(1).max(80),
  })
  .strict();

export const metadataUiActionLifecycleFeedbackSchema = z
  .object({
    label: metadataUiActionLabelSchema.optional(),
    description: metadataUiActionDescriptionSchema.optional(),
    placement: metadataUiActionFeedbackPlacementSchema.default("inline"),
  })
  .strict();

export const metadataUiActionLifecycleSchema = z
  .object({
    state: metadataUiActionLifecycleStateSchema.default("idle"),
    reason: metadataUiActionDescriptionSchema.optional(),
    liveRegion: z.enum(["off", "polite", "assertive"]).default("polite"),
    feedback: z
      .object({
        pending: metadataUiActionLifecycleFeedbackSchema.optional(),
        succeeded: metadataUiActionLifecycleFeedbackSchema.optional(),
        failed: metadataUiActionLifecycleFeedbackSchema.optional(),
        blocked: metadataUiActionLifecycleFeedbackSchema.optional(),
      })
      .strict()
      .default({}),
  })
  .strict();

export const metadataUiActionAuditSchema = z
  .object({
    required: z.boolean().default(false),
    reasonRequired: z.boolean().default(false),
    eventName: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export const metadataUiActionTelemetrySchema = z
  .object({
    eventName: z.string().trim().min(1).max(160),
    attributes: z
      .record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean()]),
      )
      .default({}),
  })
  .strict();

const metadataUiNavigationActionSchema = z
  .object({
    kind: z.literal("navigation"),
    href: metadataUiSafeNavigationHrefSchema,
    target: metadataUiActionTargetSchema.default("self"),
  })
  .strict();

const metadataUiExternalLinkActionSchema = z
  .object({
    kind: z.literal("external-link"),
    href: metadataUiSafeExternalHrefSchema,
    target: z.literal("new-tab"),
  })
  .strict();

const metadataUiServerActionSchema = z
  .object({
    kind: z.literal("server-action"),
    actionKey: METADATA_UI_ACTION_KEY_SCHEMA,
  })
  .strict();

const metadataUiClientEventActionSchema = z
  .object({
    kind: z.literal("client-event"),
    eventKey: METADATA_UI_ACTION_KEY_SCHEMA,
  })
  .strict();

const metadataUiActionExecutionSchema = z.discriminatedUnion("kind", [
  metadataUiNavigationActionSchema,
  metadataUiExternalLinkActionSchema,
  metadataUiServerActionSchema,
  metadataUiClientEventActionSchema,
]);

export const metadataUiActionContractSchema = z
  .object({
    schemaId: z
      .literal(METADATA_UI_ACTION_CONTRACT_SCHEMA_ID)
      .default(METADATA_UI_ACTION_CONTRACT_SCHEMA_ID),
    schemaVersion: z
      .literal(METADATA_UI_ACTION_CONTRACT_SCHEMA_VERSION)
      .default(METADATA_UI_ACTION_CONTRACT_SCHEMA_VERSION),

    id: metadataUiActionIdSchema,
    label: metadataUiActionLabelSchema,
    description: metadataUiActionDescriptionSchema.optional(),

    intent: metadataUiActionIntentSchema.default("custom"),
    tone: metadataUiActionToneSchema.default("neutral"),
    risk: metadataUiActionRiskSchema.default("low"),
    visibility: metadataUiActionVisibilitySchema.default("visible"),

    disabledReason: metadataUiActionDescriptionSchema.optional(),

    permission: metadataUiActionPermissionSchema.optional(),
    confirmation: metadataUiActionConfirmationSchema.optional(),
    lifecycle: metadataUiActionLifecycleSchema.optional(),
    audit: metadataUiActionAuditSchema.optional(),
    telemetry: metadataUiActionTelemetrySchema.optional(),

    execution: metadataUiActionExecutionSchema,

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((action, ctx) => {
    if (action.visibility === "disabled" && !action.disabledReason) {
      ctx.addIssue({
        code: "custom",
        path: ["disabledReason"],
        message: "Disabled actions must provide disabledReason.",
      });
    }

    if (
      action.lifecycle?.state === "blocked" &&
      !action.lifecycle.reason &&
      !action.lifecycle.feedback.blocked?.description &&
      !action.disabledReason
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["lifecycle", "reason"],
        message:
          "Blocked actions must provide a lifecycle reason, blocked feedback description, or disabledReason.",
      });
    }

    if (
      action.lifecycle?.state === "failed" &&
      !action.lifecycle.reason &&
      !action.lifecycle.feedback.failed?.description
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["lifecycle", "feedback", "failed"],
        message:
          "Failed actions must provide a lifecycle reason or failed feedback description.",
      });
    }

    if (
      (action.risk === "high" || action.risk === "critical") &&
      !action.confirmation
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmation"],
        message: "High and critical actions must require confirmation.",
      });
    }

    if (action.risk === "critical" && !action.audit?.required) {
      ctx.addIssue({
        code: "custom",
        path: ["audit", "required"],
        message: "Critical actions must require audit.",
      });
    }

    if (
      (action.risk === "high" || action.risk === "critical") &&
      action.execution.kind === "server-action" &&
      !action.permission
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["permission"],
        message:
          "High and critical server actions must declare a permission gate.",
      });
    }

    if (action.execution.kind === "navigation") {
      const { href } = action.execution;
      if (METADATA_UI_UNSAFE_HREF.test(href)) {
        ctx.addIssue({
          code: "custom",
          path: ["execution", "href"],
          message: "Navigation href must not use unsafe URL schemes.",
        });
      }
      if (
        !METADATA_UI_RELATIVE_HREF.test(href) &&
        !href.startsWith("http://") &&
        !href.startsWith("https://")
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["execution", "href"],
          message:
            "Navigation href must be relative (/…), hash (#…), or http(s) URL.",
        });
      }
    }

    if (action.execution.kind === "external-link") {
      const { href } = action.execution;
      if (METADATA_UI_UNSAFE_HREF.test(href)) {
        ctx.addIssue({
          code: "custom",
          path: ["execution", "href"],
          message: "External links must not use unsafe URL schemes.",
        });
      }
    }
  });

export type MetadataUiActionKind = z.infer<typeof metadataUiActionKindSchema>;
export type MetadataUiActionIntent = z.infer<
  typeof metadataUiActionIntentSchema
>;
export type MetadataUiActionTone = z.infer<typeof metadataUiActionToneSchema>;
export type MetadataUiActionRisk = z.infer<typeof metadataUiActionRiskSchema>;
export type MetadataUiActionVisibility = z.infer<
  typeof metadataUiActionVisibilitySchema
>;
export type MetadataUiActionLifecycleState = z.infer<
  typeof metadataUiActionLifecycleStateSchema
>;
export type MetadataUiActionFeedbackPlacement = z.infer<
  typeof metadataUiActionFeedbackPlacementSchema
>;
export type MetadataUiActionTarget = z.infer<
  typeof metadataUiActionTargetSchema
>;

export type MetadataUiActionPermission = z.infer<
  typeof metadataUiActionPermissionSchema
>;
export type MetadataUiActionConfirmation = z.infer<
  typeof metadataUiActionConfirmationSchema
>;
export type MetadataUiActionLifecycleFeedback = z.infer<
  typeof metadataUiActionLifecycleFeedbackSchema
>;
export type MetadataUiActionLifecycle = z.infer<
  typeof metadataUiActionLifecycleSchema
>;
export type MetadataUiActionAudit = z.infer<typeof metadataUiActionAuditSchema>;
export type MetadataUiActionTelemetry = z.infer<
  typeof metadataUiActionTelemetrySchema
>;
export type MetadataUiActionExecution = z.infer<
  typeof metadataUiActionExecutionSchema
>;

type MetadataUiActionContractSchemaOutput = z.output<
  typeof metadataUiActionContractSchema
>;
export type MetadataUiActionContractInput = z.input<
  typeof metadataUiActionContractSchema
>;

export type MetadataUiActionExecutionForKind<
  Kind extends MetadataUiActionKind,
> = Extract<MetadataUiActionExecution, { kind: Kind }>;

export type MetadataUiActionExecutionByKind = {
  [Kind in MetadataUiActionKind]: MetadataUiActionExecutionForKind<Kind>;
};

type MetadataUiDisabledVisibilityState =
  | {
      visibility: "disabled";
      disabledReason: string;
    }
  | {
      visibility: Exclude<MetadataUiActionVisibility, "disabled">;
      disabledReason?: string;
    };

type MetadataUiActionAuditRequired = MetadataUiActionAudit & {
  required: true;
};

type MetadataUiActionRiskState<
  Execution extends MetadataUiActionExecution,
> =
  | {
      risk: "low" | "medium";
      permission?: MetadataUiActionPermission;
      confirmation?: MetadataUiActionConfirmation;
      audit?: MetadataUiActionAudit;
    }
  | (Execution extends { kind: "server-action" }
      ? {
          risk: "high";
          permission: MetadataUiActionPermission;
          confirmation: MetadataUiActionConfirmation;
          audit?: MetadataUiActionAudit;
        }
      : {
          risk: "high";
          permission?: MetadataUiActionPermission;
          confirmation: MetadataUiActionConfirmation;
          audit?: MetadataUiActionAudit;
        })
  | (Execution extends { kind: "server-action" }
      ? {
          risk: "critical";
          permission: MetadataUiActionPermission;
          confirmation: MetadataUiActionConfirmation;
          audit: MetadataUiActionAuditRequired;
        }
      : {
          risk: "critical";
          permission?: MetadataUiActionPermission;
          confirmation: MetadataUiActionConfirmation;
          audit: MetadataUiActionAuditRequired;
        });

type MetadataUiActionContractBase = Omit<
  MetadataUiActionContractSchemaOutput,
  | "audit"
  | "confirmation"
  | "disabledReason"
  | "execution"
  | "permission"
  | "risk"
  | "visibility"
>;

export type MetadataUiActionContractForKind<
  Kind extends MetadataUiActionKind,
> = MetadataUiActionContractBase &
  MetadataUiDisabledVisibilityState &
  MetadataUiActionRiskState<MetadataUiActionExecutionForKind<Kind>> & {
    execution: MetadataUiActionExecutionForKind<Kind>;
  };

export type MetadataUiActionContract = {
  [Kind in MetadataUiActionKind]: MetadataUiActionContractForKind<Kind>;
}[MetadataUiActionKind];

export type MetadataUiActionContractParseResult =
  | {
      success: true;
      data: MetadataUiActionContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiActionContractInvariants(
  action: MetadataUiActionContractSchemaOutput,
): asserts action is MetadataUiActionContract {
  if (action.visibility === "disabled" && !action.disabledReason) {
    throw new Error("Disabled actions must provide disabledReason.");
  }

  if (
    action.lifecycle?.state === "blocked" &&
    !action.lifecycle.reason &&
    !action.lifecycle.feedback.blocked?.description &&
    !action.disabledReason
  ) {
    throw new Error(
      "Blocked actions must provide a lifecycle reason, blocked feedback description, or disabledReason.",
    );
  }

  if (
    action.lifecycle?.state === "failed" &&
    !action.lifecycle.reason &&
    !action.lifecycle.feedback.failed?.description
  ) {
    throw new Error(
      "Failed actions must provide a lifecycle reason or failed feedback description.",
    );
  }

  if (
    (action.risk === "high" || action.risk === "critical") &&
    !action.confirmation
  ) {
    throw new Error("High and critical actions must require confirmation.");
  }

  if (action.risk === "critical" && !action.audit?.required) {
    throw new Error("Critical actions must require audit.");
  }

  if (
    (action.risk === "high" || action.risk === "critical") &&
    action.execution.kind === "server-action" &&
    !action.permission
  ) {
    throw new Error(
      "High and critical server actions must declare a permission gate.",
    );
  }
}

export function parseMetadataUiActionContract(
  input: unknown,
): MetadataUiActionContract {
  const action = metadataUiActionContractSchema.parse(input);
  assertMetadataUiActionContractInvariants(action);
  return action;
}

export function safeParseMetadataUiActionContract(
  input: unknown,
): MetadataUiActionContractParseResult {
  const result = metadataUiActionContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiActionContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
