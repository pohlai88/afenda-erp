"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import {
  Badge,
  Button,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@afenda/ui";
import { useActionState } from "react";

export type LynxRunFeedbackAction = (
  state: ActionResult | undefined,
  payload: FormData,
) => Promise<ActionResult | undefined>;

export function LynxRunFeedbackForm({
  recordFeedbackAction,
  runId,
}: {
  recordFeedbackAction: LynxRunFeedbackAction;
  runId: string;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(recordFeedbackAction, undefined);

  return (
    <form action={formAction} className="@container flex flex-col gap-4">
      <input name="runId" type="hidden" value={runId} />
      <div className="grid gap-3 @sm:grid-cols-2">
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
            <NativeSelectOption value="wrong-tool">
              Wrong tool
            </NativeSelectOption>
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
        <Badge aria-live="polite" role="status" variant="success">
          Feedback saved for this run.
        </Badge>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save feedback"}
      </Button>
    </form>
  );
}
