export type ModuleDataMode = "persisted" | "metadata";

export function resolveWorkspaceDataMode(
  sessionSource: "dev" | "neon",
): ModuleDataMode {
  return sessionSource === "neon" ? "persisted" : "metadata";
}

export function describeWorkspaceDataSource(input: {
  dataMode: ModuleDataMode;
  fallbackApplied: boolean;
}) {
  if (input.dataMode === "persisted" && input.fallbackApplied) {
    return "Tenant database (metadata fallback)";
  }

  if (input.dataMode === "persisted") {
    return "Tenant database";
  }

  return "Module metadata";
}
