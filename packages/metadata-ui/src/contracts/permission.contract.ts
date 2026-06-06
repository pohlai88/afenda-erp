import { z } from "zod";

/**
 * Runtime-neutral permission contract.
 *
 * Describes authorization requirements consumed by
 * metadata-ui renderers and runtime enforcement.
 *
 * This contract does not evaluate permissions.
 * It only describes requirements.
 */

const METADATA_UI_PERMISSION_OPERATOR_VALUES = ["all", "any"] as const;

const METADATA_UI_PERMISSION_EFFECT_VALUES = ["allow", "deny"] as const;

const METADATA_UI_PERMISSION_VISIBILITY_VALUES = [
  "visible",
  "disabled",
  "hidden",
] as const;

const METADATA_UI_PERMISSION_FAILURE_SURFACE_VISIBILITY_VALUES = [
  "visible",
  "disabled",
] as const;

export const metadataUiPermissionOperatorSchema = z.enum(
  METADATA_UI_PERMISSION_OPERATOR_VALUES,
);

export const metadataUiPermissionEffectSchema = z.enum(
  METADATA_UI_PERMISSION_EFFECT_VALUES,
);

export const metadataUiPermissionVisibilitySchema = z.enum(
  METADATA_UI_PERMISSION_VISIBILITY_VALUES,
);

export const metadataUiPermissionFailureSurfaceVisibilitySchema = z.enum(
  METADATA_UI_PERMISSION_FAILURE_SURFACE_VISIBILITY_VALUES,
);

export const metadataUiCapabilityKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[._][a-z0-9]+)*$/,
    "Capability keys must use dot or underscore notation.",
  );

export const metadataUiPermissionRequirementSchema = z.object({
  capability: metadataUiCapabilityKeySchema,
  effect: metadataUiPermissionEffectSchema.default("allow"),
});

const metadataUiPermissionFailureHiddenSchema = z
  .object({
    visibility: z.literal("hidden").default("hidden"),
    title: z.never().optional(),
    description: z.never().optional(),
  })
  .strict();

const metadataUiPermissionFailureSurfaceSchema = z
  .object({
    visibility: metadataUiPermissionFailureSurfaceVisibilitySchema,
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(240).optional(),
  })
  .strict();

export const metadataUiPermissionFailureSchema = z
  .union([
    metadataUiPermissionFailureHiddenSchema,
    metadataUiPermissionFailureSurfaceSchema,
  ])
  .default({
    visibility: "hidden",
  });

export const metadataUiPermissionContractSchema = z
  .object({
    operator: metadataUiPermissionOperatorSchema.default("all"),

    requirements: z.array(metadataUiPermissionRequirementSchema).min(1),

    failure: metadataUiPermissionFailureSchema.default({
      visibility: "hidden",
    }),
  })
  .superRefine((permission, ctx) => {
    const unique = new Set<string>();

    for (const requirement of permission.requirements) {
      const key = `${requirement.effect}:${requirement.capability}`;

      if (unique.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["requirements"],
          message: `Duplicate permission requirement: ${key}`,
        });
      }

      unique.add(key);
    }

    if (
      permission.failure.visibility !== "hidden" &&
      !permission.failure.title
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["failure", "title"],
        message:
          "Visible or disabled permission failures must provide a title.",
      });
    }
  });

export type MetadataUiPermissionOperator = z.infer<
  typeof metadataUiPermissionOperatorSchema
>;

export type MetadataUiPermissionEffect = z.infer<
  typeof metadataUiPermissionEffectSchema
>;

export type MetadataUiPermissionVisibility = z.infer<
  typeof metadataUiPermissionVisibilitySchema
>;

export type MetadataUiPermissionFailureSurfaceVisibility = z.infer<
  typeof metadataUiPermissionFailureSurfaceVisibilitySchema
>;

export type MetadataUiCapabilityKey = z.infer<
  typeof metadataUiCapabilityKeySchema
>;

export type MetadataUiPermissionRequirement = z.output<
  typeof metadataUiPermissionRequirementSchema
>;

export type MetadataUiPermissionFailure = z.infer<
  typeof metadataUiPermissionFailureSchema
>;

type MetadataUiPermissionContractSchemaOutput = z.output<
  typeof metadataUiPermissionContractSchema
>;

export type MetadataUiPermissionContractInput = z.input<
  typeof metadataUiPermissionContractSchema
>;

declare const metadataUiUniquePermissionRequirementsBrand: unique symbol;

export type MetadataUiPermissionRequirementKey<
  Requirement extends Pick<
    MetadataUiPermissionRequirement,
    "capability" | "effect"
  >,
> = `${Requirement["effect"]}:${Requirement["capability"]}`;

export type MetadataUiPermissionRequirementsByEffect<
  Requirements extends readonly MetadataUiPermissionRequirement[],
> = {
  [Effect in MetadataUiPermissionEffect]: Extract<
    Requirements[number],
    { effect: Effect }
  >[];
};

export type MetadataUiNonEmptyPermissionRequirements = [
  MetadataUiPermissionRequirement,
  ...MetadataUiPermissionRequirement[],
];

export type MetadataUiUniquePermissionRequirements =
  MetadataUiNonEmptyPermissionRequirements & {
    readonly [metadataUiUniquePermissionRequirementsBrand]: true;
  };

export type MetadataUiPermissionContract = Omit<
  MetadataUiPermissionContractSchemaOutput,
  "requirements"
> & {
  requirements: MetadataUiUniquePermissionRequirements;
};

export type MetadataUiPermissionContractParseResult =
  | {
      success: true;
      data: MetadataUiPermissionContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiPermissionContractInvariants(
  permission: MetadataUiPermissionContractSchemaOutput,
): asserts permission is MetadataUiPermissionContract {
  if (permission.requirements.length < 1) {
    throw new Error("Permission contracts require at least one requirement.");
  }

  const unique = new Set<string>();

  for (const requirement of permission.requirements) {
    const key: MetadataUiPermissionRequirementKey<typeof requirement> =
      `${requirement.effect}:${requirement.capability}`;

    if (unique.has(key)) {
      throw new Error(`Duplicate permission requirement: ${key}`);
    }

    unique.add(key);
  }
}

export function parseMetadataUiPermissionContract(
  input: unknown,
): MetadataUiPermissionContract {
  const permission = metadataUiPermissionContractSchema.parse(input);
  assertMetadataUiPermissionContractInvariants(permission);
  return permission;
}

export function safeParseMetadataUiPermissionContract(
  input: unknown,
): MetadataUiPermissionContractParseResult {
  const result = metadataUiPermissionContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiPermissionContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
