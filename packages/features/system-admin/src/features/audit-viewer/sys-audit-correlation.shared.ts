export type AuditCorrelationRefs = {
  policyKeys: readonly string[];
  approvalKeys: readonly string[];
};

export function extractAuditCorrelationRefs(
  metadata: Record<string, unknown> | null | undefined,
): AuditCorrelationRefs {
  const policyKeys = new Set<string>();
  const approvalKeys = new Set<string>();

  if (!metadata) {
    return {
      policyKeys: [] as readonly string[],
      approvalKeys: [] as readonly string[],
    };
  }

  const addString = (set: Set<string>, value: unknown) => {
    if (typeof value === "string" && value.length > 0) {
      set.add(value);
    }
  };

  const addArray = (set: Set<string>, value: unknown) => {
    if (!Array.isArray(value)) {
      return;
    }

    for (const entry of value) {
      addString(set, entry);
    }
  };

  addString(policyKeys, metadata.policyKey);
  addArray(policyKeys, metadata.policyKeys);
  addString(approvalKeys, metadata.approvalKey);
  addArray(approvalKeys, metadata.approvalKeys);

  return {
    policyKeys: [...policyKeys],
    approvalKeys: [...approvalKeys],
  };
}
