export function getQualityGateStatus(summary: Record<string, unknown>) {
  return typeof summary.status === "string" ? summary.status : "-";
}

export function getUnsupportedClaimCount(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  if (typeof gate !== "object" || gate === null) {
    return "-";
  }

  const value = (gate as Record<string, unknown>).unsupportedClaimCount;
  return typeof value === "number" ? String(value) : "-";
}

export function getRunQualityGateStatus(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  if (typeof gate !== "object" || gate === null) {
    return "-";
  }

  const value = (gate as Record<string, unknown>).status;
  return typeof value === "string" ? value : "-";
}

export function getMetadataString(
  metadata: Record<string, unknown>,
  key: "origin" | "monitorStatus" | "severity" | "ownerAuthUserId",
) {
  const value = metadata[key];
  return typeof value === "string" ? value : undefined;
}
