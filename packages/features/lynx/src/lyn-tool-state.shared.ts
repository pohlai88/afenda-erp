export type LynxToolStateTone = "success" | "warning" | "critical" | "outline";

export function getLynxToolStateLabel(value: unknown) {
  if (value === "approval-requested") {
    return "awaiting approval";
  }

  if (value === "approval-responded") {
    return "approval recorded";
  }

  if (value === "input-streaming" || value === "input-available") {
    return "resolving";
  }

  if (value === "output-available") {
    return "completed";
  }

  if (value === "output-denied") {
    return "rejected";
  }

  if (value === "blocked" || value === "output-error" || value === "error") {
    return "blocked";
  }

  return typeof value === "string" && value.length > 0 ? value : "pending";
}

export function getLynxToolStateTone(value: unknown): LynxToolStateTone {
  if (
    value === "available" ||
    value === "approved" ||
    value === "completed" ||
    value === "healthy" ||
    value === "output-available" ||
    value === "passed" ||
    value === "supported"
  ) {
    return "success";
  }

  if (
    value === "blocked" ||
    value === "critical" ||
    value === "error" ||
    value === "failed" ||
    value === "output-denied" ||
    value === "output-error" ||
    value === "rejected" ||
    value === "unsupported" ||
    value === "unavailable"
  ) {
    return "critical";
  }

  if (
    value === "approval-requested" ||
    value === "approval-responded" ||
    value === "input-available" ||
    value === "input-streaming" ||
    value === "partial" ||
    value === "pending" ||
    value === "review" ||
    value === "watch" ||
    value === "medium" ||
    value === "low"
  ) {
    return "warning";
  }

  return "outline";
}
