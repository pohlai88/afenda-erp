"use client"

import { Button } from "@afenda/ui/button"

type LmsLearningPathArchiveButtonProps = {
  organizationId: string
  orgSlug: string
  learningPathId: string
  archiveAction: (formData: FormData) => void | Promise<void>
  label: string
}

export function LmsLearningPathArchiveButton({
  organizationId,
  orgSlug,
  learningPathId,
  archiveAction,
  label,
}: LmsLearningPathArchiveButtonProps) {
  return (
    <form action={archiveAction}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="learningPathId" value={learningPathId} />
      <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs">
        {label}
      </Button>
    </form>
  )
}
