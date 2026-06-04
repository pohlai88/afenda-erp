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
});

export const metadataUiRuntimeFileSuffixSchema = z.enum(
  METADATA_UI_RUNTIME_FILE_SUFFIX_VALUES,
);

export const metadataUiRuntimeDirectiveSchema = z.enum(
  METADATA_UI_RUNTIME_DIRECTIVE_VALUES,
);

export const metadataUiRuntimeModuleContractSchema = z
  .object({
    id: z
      .string()
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

    description: z.string().min(1).max(240).optional(),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((module, ctx) => {
    if (module.runtime === "client" && module.directive !== "use-client") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["directive"],
        message: "Client runtime modules must declare use-client.",
      });
    }

    if (module.runtime === "server" && module.directive === "use-client") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["directive"],
        message: "Server runtime modules must not declare use-client.",
      });
    }

    if (module.runtime === "action" && module.directive !== "use-server") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["directive"],
        message: "Action runtime modules must declare use-server.",
      });
    }

    if (
      module.runtime === "shared" &&
      module.directive !== "none"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["directive"],
        message: "Shared runtime modules must not declare runtime directives.",
      });
    }

    if (
      module.runtime === "client" &&
      module.allowedDoors.includes("server")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDoors"],
        message: "Client modules must not be exported through the server door.",
      });
    }

    if (
      module.runtime === "server" &&
      module.allowedDoors.includes("client")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDoors"],
        message: "Server modules must not be exported through the client door.",
      });
    }

    if (
      module.runtime === "shared" &&
      module.allowedDoors.some((door) => !["index", "client", "server"].includes(door))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDoors"],
        message: "Shared modules may only be exported through known runtime doors.",
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
  client: "use-client";
  action: "use-server";
  server: Exclude<MetadataUiRuntimeDirective, "use-client">;
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
  "allowedDoors" | "directive" | "id" | "runtime"
> & {
  id: MetadataUiRuntimeModuleId;
  runtime: Runtime;
  directive: MetadataUiRuntimeDirectiveForRuntime<Runtime>;
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

  if (module.runtime === "server" && module.directive === "use-client") {
    throw new Error("Server runtime modules must not declare use-client.");
  }

  if (module.runtime === "action" && module.directive !== "use-server") {
    throw new Error("Action runtime modules must declare use-server.");
  }

  if (module.runtime === "shared" && module.directive !== "none") {
    throw new Error("Shared runtime modules must not declare runtime directives.");
  }

  if (module.runtime === "client" && module.allowedDoors.includes("server")) {
    throw new Error("Client modules must not be exported through the server door.");
  }

  if (module.runtime === "server" && module.allowedDoors.includes("client")) {
    throw new Error("Server modules must not be exported through the client door.");
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
