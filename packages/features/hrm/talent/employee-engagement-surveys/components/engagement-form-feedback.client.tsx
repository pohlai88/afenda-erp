"use client"

import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

function resolveEngagementFormErrorMessage(
  errors: Record<string, string | undefined>
): string | undefined {
  if (errors.form) return errors.form
  for (const value of Object.values(errors)) {
    if (value) return value
  }
  return undefined
}

export function EngagementFormFeedback({
  state,
  savedLabel = "Saved.",
}: {
  state: EngagementDesignFormState | undefined
  savedLabel?: string
}) {
  if (!state) return null
  if (state.ok) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {savedLabel}
      </p>
    )
  }
  const message = resolveEngagementFormErrorMessage(state.errors)
  if (!message) return null
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}
