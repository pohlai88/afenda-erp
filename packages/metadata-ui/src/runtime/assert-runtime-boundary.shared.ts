import type {
  MetadataUiRuntime,
  MetadataUiRuntimeDirective,
  MetadataUiRuntimeDoor,
  MetadataUiRuntimeFileSuffix,
  MetadataUiRuntimeModuleContract,
} from "../contracts/runtime.contract";
import { MetadataUiRuntimeError } from "./runtime-error.shared";

const METADATA_UI_RUNTIME_SUFFIX_BY_RUNTIME = {
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

const METADATA_UI_RUNTIME_DIRECTIVE_BY_RUNTIME = {
  shared: "none",
  server: "server-only",
  client: "use-client",
  action: "use-server",
} as const satisfies Record<MetadataUiRuntime, MetadataUiRuntimeDirective>;

const METADATA_UI_RUNTIME_DOORS_BY_RUNTIME = {
  shared: ["index", "client", "server"],
  server: ["server"],
  client: ["client"],
  action: ["index", "server"],
} as const satisfies Record<MetadataUiRuntime, readonly MetadataUiRuntimeDoor[]>;

export function inferMetadataUiRuntimeFromFileName(
  fileName: string,
): MetadataUiRuntime | undefined {
  for (const runtime of Object.keys(
    METADATA_UI_RUNTIME_SUFFIX_BY_RUNTIME,
  ) as MetadataUiRuntime[]) {
    if (
      METADATA_UI_RUNTIME_SUFFIX_BY_RUNTIME[runtime].some((suffix) =>
        fileName.endsWith(suffix),
      )
    ) {
      return runtime;
    }
  }

  return undefined;
}

export function isMetadataUiRuntimeDoorAllowed(
  runtime: MetadataUiRuntime,
  door: MetadataUiRuntimeDoor,
): boolean {
  const allowedDoors: readonly MetadataUiRuntimeDoor[] =
    METADATA_UI_RUNTIME_DOORS_BY_RUNTIME[runtime];

  return allowedDoors.includes(door);
}

export function assertMetadataUiRuntimeDoorAllowed(
  runtime: MetadataUiRuntime,
  door: MetadataUiRuntimeDoor,
): void {
  if (!isMetadataUiRuntimeDoorAllowed(runtime, door)) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.invalid-door",
      `Metadata UI ${runtime} runtime cannot be exported through the ${door} door.`,
      { runtime, door },
    );
  }
}

export function assertMetadataUiRuntimeFileName(
  fileName: string,
  expectedRuntime: MetadataUiRuntime,
): void {
  const runtime = inferMetadataUiRuntimeFromFileName(fileName);
  if (runtime !== expectedRuntime) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.boundary",
      `Metadata UI file "${fileName}" must be ${expectedRuntime} runtime.`,
      { runtime, expectedRuntime },
    );
  }
}

export function assertMetadataUiRuntimeModuleBoundary(
  module: MetadataUiRuntimeModuleContract,
): void {
  const expectedDirective =
    METADATA_UI_RUNTIME_DIRECTIVE_BY_RUNTIME[module.runtime];

  if (module.directive !== expectedDirective) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.boundary",
      `Metadata UI ${module.runtime} module "${module.id}" has invalid runtime directive.`,
      { runtime: module.runtime },
    );
  }

  for (const door of module.allowedDoors) {
    assertMetadataUiRuntimeDoorAllowed(module.runtime, door);
  }
}
