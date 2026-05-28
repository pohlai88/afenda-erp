"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import { Textarea } from "@afenda/ui/textarea";
import { useActionState } from "react";

import { recordLynxRunFeedbackAction } from "@/app/(app)/solution-console/runs/[runId]/feedback-actions";

export function LynxRunFeedbackForm({ runId }: { runId: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(recordLynxRunFeedbackAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="runId" type="hidden" value={runId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Rating
          <NativeSelect
            className="w-full"
            name="rating"
            defaultValue="positive"
          >
            <NativeSelectOption value="positive">Positive</NativeSelectOption>
            <NativeSelectOption value="negative">Negative</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Category
          <NativeSelect
            className="w-full"
            name="category"
            defaultValue="accurate"
          >
            <NativeSelectOption value="accurate">Accurate</NativeSelectOption>
            <NativeSelectOption value="unsupported">
              Unsupported
            </NativeSelectOption>
            <NativeSelectOption value="wrong-tool">Wrong tool</NativeSelectOption>
            <NativeSelectOption value="slow">Slow</NativeSelectOption>
            <NativeSelectOption value="unsafe">Unsafe</NativeSelectOption>
            <NativeSelectOption value="other">Other</NativeSelectOption>
          </NativeSelect>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Note
        <Textarea
          maxLength={1000}
          name="note"
          placeholder="Add review notes for audit and replay."
        />
      </label>
      <ActionFormErrors result={state} />
      {state?.ok ? (
        <p className="text-sm text-muted-foreground" role="status">
          Feedback saved for this run.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save feedback"}
      </Button>
    </form>
  );
}
