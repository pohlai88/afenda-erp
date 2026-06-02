/**
 * Metadata public door for @afenda/ai.
 *
 * Keep this door free of provider clients, database access, and runtime work.
 */
export const aiFeatureFlags = [
  "assistant",
  "document-extraction",
  "approval-tool",
] as const;
