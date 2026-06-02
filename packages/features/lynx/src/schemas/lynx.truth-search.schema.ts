import { z } from "zod";

export const lynxTruthSearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(800),
});

export const lynxTruthSearchUiRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(20),
});

function getTextFromPart(part: unknown): string {
  if (
    typeof part === "object" &&
    part !== null &&
    (part as { type?: unknown }).type === "text" &&
    typeof (part as { text?: unknown }).text === "string"
  ) {
    return (part as { text: string }).text;
  }

  return "";
}

export function extractLatestQueryFromLynxTruthUiMessages(
  messages: unknown[],
): string | null {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (typeof message !== "object" || message === null) {
      continue;
    }

    const record = message as { role?: unknown; parts?: unknown };
    if (record.role !== "user" || !Array.isArray(record.parts)) {
      continue;
    }

    const text = record.parts.map(getTextFromPart).join(" ").trim();
    if (text) {
      return text.slice(0, 800);
    }
  }

  return null;
}
