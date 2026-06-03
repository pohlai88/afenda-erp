export type LynxChatStatus = "ready" | "listening" | "resolving" | "blocked";
export type LynxRunStepState =
  | "listening"
  | "resolving"
  | "verified"
  | "blocked";

const fencedCodeBoundaryPattern = /^\s*(```|~~~)/;
const citationPattern = /(^|[^!])\[(\d{1,3})\](?!\()/g;

export function getLynxChatStatus(status: string): LynxChatStatus {
  if (status === "submitted") {
    return "listening";
  }

  if (status === "streaming") {
    return "resolving";
  }

  if (status === "error") {
    return "blocked";
  }

  return "ready";
}

export function isSafeLynxHref(href: string | undefined) {
  if (!href) {
    return false;
  }

  if (href.startsWith("#") || href.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(href);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function linkLynxCitations(
  markdown: string,
  citationTargetPrefix?: string,
) {
  if (!citationTargetPrefix) {
    return markdown;
  }

  let insideFence = false;

  return markdown
    .split("\n")
    .map((line) => {
      if (fencedCodeBoundaryPattern.test(line)) {
        insideFence = !insideFence;
        return line;
      }

      if (insideFence) {
        return line;
      }

      return line.replace(
        citationPattern,
        (_match, prefix: string, passage: string) =>
          `${prefix}[[${passage}]](#${citationTargetPrefix}-${passage})`,
      );
    })
    .join("\n");
}

export function getLynxRunStepState(value: unknown): LynxRunStepState {
  if (
    value === "available" ||
    value === "approved" ||
    value === "completed" ||
    value === "healthy" ||
    value === "output-available" ||
    value === "passed" ||
    value === "supported"
  ) {
    return "verified";
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
    return "blocked";
  }

  if (
    value === "approval-requested" ||
    value === "approval-responded" ||
    value === "input-available" ||
    value === "input-streaming" ||
    value === "partial" ||
    value === "pending" ||
    value === "review" ||
    value === "watch"
  ) {
    return "resolving";
  }

  return "listening";
}
