import { z } from "zod";

/**
 * Runtime-neutral runtime contract.
 *
 * Defines Metadata UI runtime identities, runtime ownership,
 * render states, and boundary declarations.
 *
 * This file does not import React, server-only modules, client modules,
 * browser APIs, ERP services, or feature-domain logic.
 */

const METADATA_UI_RUNTIME_VALUES = [
  "shared",
  "server",
  "client",
  "action",
] as const;

const METADATA_UI_RUNTIME_DOOR_VALUES = [
  "index",
  "client",
  "server",
] as const;

const METADATA_UI_RUNTIME_STABILITY_VALUES = [
  "stable",
  "experimental",
  "deprecated",
] as const;

const METADATA_UI_RENDERABLE_STATE_VALUES = [
  "ready",
  "loading",
  "empty",
  "forbidden",
  "invalid",
  "error",
] as const;

const METADATA_UI_RUNTIME_FILE_SUFFIX_VALUES = [
  ".shared.ts",
  ".schema.ts",
  ".contract.ts",
  ".builder.ts",
  ".registry.ts",
  ".server.ts",
  ".server.tsx",
  ".client.ts",
  ".client.tsx",
  ".action.ts",
] as const;

const METADATA_UI_RUNTIME_DIRECTIVE_VALUES = [
  "none",
  "use-client",
  "use-server",
  "server-only",
] as const;

export const metadataUiRuntimeSchema = z.enum(METADATA_UI_RUNTIME_VALUES);

export const metadataUiRuntimeDoorSchema = z.enum(
  METADATA_UI_RUNTIME_DOOR_VALUES,
);

export const metadataUiRuntimeStabilitySchema = z.enum(
  METADATA_UI_RUNTIME_STABILITY_VALUES,
);

export const metadataUiRenderableStateSchema = z.enum(
  METADATA_UI_RENDERABLE_STATE_VALUES,
);

export const metadataUiRuntimeBoundarySchema = z.object({
  runtime: metadataUiRuntimeSchema,
  door: metadataUiRuntimeDoorSchema.optional(),
  stability: metadataUiRuntimeStabilitySchema.default("stable"),
}).strict();

export const metadataUiRuntimeFileSuffixSchema = z.enum(
  METADATA_UI_RUNTIME_FILE_SUFFIX_VALUES,
);

export const metadataUiRuntimeDirectiveSchema = z.enum(
  METADATA_UI_RUNTIME_DIRECTIVE_VALUES,
);

function includesMetadataUiRuntimeValue<Value extends string>(
  values: readonly Value[],
  candidate: string,
): candidate is Value {
  return values.includes(candidate as Value);
}

const METADATA_UI_RUNTIME_ALLOWED_FILE_SUFFIXES_BY_RUNTIME = {
  shared: [
    ".shared.ts",
    ".schema.ts",
    ".contract.ts",
    ".builder.ts",
    ".registry.ts",
  ],
  server: [".server.ts", ".server.tsx"],
  client: [".client.ts", ".client.tsx"],
  action: [".action.ts"],
} as const satisfies Record<MetadataUiRuntime, readonly MetadataUiRuntimeFileSuffix[]>;

const METADATA_UI_RUNTIME_ALLOWED_DOORS_BY_RUNTIME = {
  shared: ["index", "client", "server"],
  server: ["index", "server"],
  client: ["index", "client"],
  action: ["index", "server"],
} as const satisfies Record<MetadataUiRuntime, readonly MetadataUiRuntimeDoor[]>;

const METADATA_UI_RUNTIME_ALLOWED_DIRECTIVES_BY_RUNTIME = {
  shared: ["none"],
  server: ["server-only"],
  client: ["use-client"],
  action: ["use-server"],
} as const satisfies Record<
  MetadataUiRuntime,
  readonly MetadataUiRuntimeDirective[]
>;

export const metadataUiRuntimeModuleContractSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(
        /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
        "Runtime module id must use lowercase kebab/dot notation.",
      ),

    runtime: metadataUiRuntimeSchema,

    fileSuffix: metadataUiRuntimeFileSuffixSchema,

    directive: metadataUiRuntimeDirectiveSchema.default("none"),

    allowedDoors: z.array(metadataUiRuntimeDoorSchema).default([]),

    stability: metadataUiRuntimeStabilitySchema.default("stable"),

    description: z.string().trim().min(1).max(240).optional(),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((module, ctx) => {
    const allowedDirectives =
      METADATA_UI_RUNTIME_ALLOWED_DIRECTIVES_BY_RUNTIME[
        module.runtime
      ] as readonly MetadataUiRuntimeDirective[];
    if (!includesMetadataUiRuntimeValue(allowedDirectives, module.directive)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["directive"],
        message: `Runtime "${module.runtime}" must use one of: ${allowedDirectives.join(", ")}.`,
      });
    }

    const allowedDoors =
      METADATA_UI_RUNTIME_ALLOWED_DOORS_BY_RUNTIME[
        module.runtime
      ] as readonly MetadataUiRuntimeDoor[];
    const invalidDoors = module.allowedDoors.filter(
      (door): door is MetadataUiRuntimeDoor =>
        !includesMetadataUiRuntimeValue(allowedDoors, door),
    );
    if (invalidDoors.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDoors"],
        message: `Runtime "${module.runtime}" cannot be exported through ${invalidDoors.join(", ")}.`,
      });
    }

    const allowedFileSuffixes =
      METADATA_UI_RUNTIME_ALLOWED_FILE_SUFFIXES_BY_RUNTIME[
        module.runtime
      ] as readonly MetadataUiRuntimeFileSuffix[];
    if (
      !includesMetadataUiRuntimeValue(allowedFileSuffixes, module.fileSuffix)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileSuffix"],
        message: `Runtime "${module.runtime}" requires one of: ${allowedFileSuffixes.join(", ")}.`,
      });
    }
  });

export type MetadataUiRuntime = z.infer<typeof metadataUiRuntimeSchema>;

export type MetadataUiRuntimeDoor = z.infer<typeof metadataUiRuntimeDoorSchema>;

export type MetadataUiRuntimeStability = z.infer<
  typeof metadataUiRuntimeStabilitySchema
>;

export type MetadataUiRenderableState = z.infer<
  typeof metadataUiRenderableStateSchema
>;

export type MetadataUiRuntimeBoundary = z.infer<
  typeof metadataUiRuntimeBoundarySchema
>;

export type MetadataUiRuntimeFileSuffix = z.infer<
  typeof metadataUiRuntimeFileSuffixSchema
>;

export type MetadataUiRuntimeDirective = z.infer<
  typeof metadataUiRuntimeDirectiveSchema
>;

type MetadataUiRuntimeModuleContractSchemaOutput = z.output<
  typeof metadataUiRuntimeModuleContractSchema
>;

export type MetadataUiRuntimeModuleContractInput = z.input<
  typeof metadataUiRuntimeModuleContractSchema
>;

declare const metadataUiRuntimeModuleIdBrand: unique symbol;

export type MetadataUiRuntimeModuleId = string & {
  readonly [metadataUiRuntimeModuleIdBrand]: true;
};

export type MetadataUiRuntimeModuleIdFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` &
  MetadataUiRuntimeModuleId;

export type MetadataUiRuntimeDirectiveByRuntime = {
  shared: "none";
  server: "server-only";
  client: "use-client";
  action: "use-server";
};

export type MetadataUiRuntimeDirectiveForRuntime<
  Runtime extends MetadataUiRuntime,
> = MetadataUiRuntimeDirectiveByRuntime[Runtime];

export type MetadataUiRuntimeFileSuffixByRuntime = {
  shared:
    | ".shared.ts"
    | ".schema.ts"
    | ".contract.ts"
    | ".builder.ts"
    | ".registry.ts";
  server: ".server.ts" | ".server.tsx";
  client: ".client.ts" | ".client.tsx";
  action: ".action.ts";
};

export type MetadataUiRuntimeFileSuffixForRuntime<
  Runtime extends MetadataUiRuntime,
> = MetadataUiRuntimeFileSuffixByRuntime[Runtime];

export type MetadataUiRuntimeForFileSuffix<
  Suffix extends MetadataUiRuntimeFileSuffix,
> = {
  [Runtime in MetadataUiRuntime]: Suffix extends MetadataUiRuntimeFileSuffixForRuntime<Runtime>
    ? Runtime
    : never;
}[MetadataUiRuntime];

export type MetadataUiRuntimeAllowedDoorByRuntime = {
  shared: MetadataUiRuntimeDoor;
  client: Exclude<MetadataUiRuntimeDoor, "server">;
  server: Exclude<MetadataUiRuntimeDoor, "client">;
  action: Exclude<MetadataUiRuntimeDoor, "client">;
};

export type MetadataUiRuntimeAllowedDoorForRuntime<
  Runtime extends MetadataUiRuntime,
> = MetadataUiRuntimeAllowedDoorByRuntime[Runtime];

export type MetadataUiRuntimeModuleContractForRuntime<
  Runtime extends MetadataUiRuntime,
> = Omit<
  MetadataUiRuntimeModuleContractSchemaOutput,
  "allowedDoors" | "directive" | "fileSuffix" | "id" | "runtime"
> & {
  id: MetadataUiRuntimeModuleId;
  runtime: Runtime;
  directive: MetadataUiRuntimeDirectiveForRuntime<Runtime>;
  fileSuffix: MetadataUiRuntimeFileSuffixForRuntime<Runtime>;
  allowedDoors: MetadataUiRuntimeAllowedDoorForRuntime<Runtime>[];
};

export type MetadataUiRuntimeModuleContract = {
  [Runtime in MetadataUiRuntime]: MetadataUiRuntimeModuleContractForRuntime<Runtime>;
}[MetadataUiRuntime];

export type MetadataUiRuntimeModuleContractParseResult =
  | {
      success: true;
      data: MetadataUiRuntimeModuleContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiRuntimeModuleContractInvariants(
  module: MetadataUiRuntimeModuleContractSchemaOutput,
): asserts module is MetadataUiRuntimeModuleContract {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(module.id)) {
    throw new Error(
      "Runtime module id must use lowercase kebab/dot notation.",
    );
  }

  if (module.runtime === "client" && module.directive !== "use-client") {
    throw new Error("Client runtime modules must declare use-client.");
  }

  if (module.runtime === "action" && module.directive !== "use-server") {
    throw new Error("Action runtime modules must declare use-server.");
  }

  if (module.runtime === "server" && module.directive !== "server-only") {
    throw new Error("Server runtime modules must declare server-only.");
  }

  if (module.runtime === "shared" && module.directive !== "none") {
    throw new Error(
      "Shared runtime modules must not declare runtime directives.",
    );
  }

  if (module.runtime === "client" && module.allowedDoors.includes("server")) {
    throw new Error("Client modules must not be exported through the server door.");
  }

  if (module.runtime === "server" && module.allowedDoors.includes("client")) {
    throw new Error("Server modules must not be exported through the client door.");
  }

  const allowedDoors =
    METADATA_UI_RUNTIME_ALLOWED_DOORS_BY_RUNTIME[
      module.runtime
    ] as readonly MetadataUiRuntimeDoor[];
  const invalidDoors = module.allowedDoors.filter(
    (door): door is MetadataUiRuntimeDoor =>
      !includesMetadataUiRuntimeValue(allowedDoors, door),
  );
  if (invalidDoors.length > 0) {
    throw new Error(
      `Runtime "${module.runtime}" cannot be exported through ${invalidDoors.join(", ")}.`,
    );
  }

  const allowedFileSuffixes =
    METADATA_UI_RUNTIME_ALLOWED_FILE_SUFFIXES_BY_RUNTIME[
      module.runtime
    ] as readonly MetadataUiRuntimeFileSuffix[];
  if (!includesMetadataUiRuntimeValue(allowedFileSuffixes, module.fileSuffix)) {
    throw new Error(
      `Runtime "${module.runtime}" requires one of: ${allowedFileSuffixes.join(", ")}.`,
    );
  }
}

export function parseMetadataUiRuntimeModuleContract(
  input: unknown,
): MetadataUiRuntimeModuleContract {
  const module = metadataUiRuntimeModuleContractSchema.parse(input);
  assertMetadataUiRuntimeModuleContractInvariants(module);
  return module;
}

export function safeParseMetadataUiRuntimeModuleContract(
  input: unknown,
): MetadataUiRuntimeModuleContractParseResult {
  const result = metadataUiRuntimeModuleContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiRuntimeModuleContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
