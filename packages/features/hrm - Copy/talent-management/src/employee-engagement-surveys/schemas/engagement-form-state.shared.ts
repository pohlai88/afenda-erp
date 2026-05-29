export type EngagementDesignFormState =
  | { ok: true }
  | { ok: false; errors: Record<string, string | undefined> }
