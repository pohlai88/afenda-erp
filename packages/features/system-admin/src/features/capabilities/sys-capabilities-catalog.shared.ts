import type { ExecutionCapability } from "@afenda/kernel/execution-capabilities";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";

export function listUniqueExecutionCapabilities(): ExecutionCapability[] {
  const seen = new Set<string>();
  const unique: ExecutionCapability[] = [];

  for (const capability of listExecutionCapabilities()) {
    if (seen.has(capability.key)) {
      continue;
    }

    seen.add(capability.key);
    unique.push(capability);
  }

  return unique;
}

export function countDuplicateExecutionCapabilityKeys(): number {
  const seen = new Set<string>();
  let duplicates = 0;

  for (const capability of listExecutionCapabilities()) {
    if (seen.has(capability.key)) {
      duplicates += 1;
      continue;
    }

    seen.add(capability.key);
  }

  return duplicates;
}
