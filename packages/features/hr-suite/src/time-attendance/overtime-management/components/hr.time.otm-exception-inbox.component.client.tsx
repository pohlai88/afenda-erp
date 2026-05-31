"use client";

import { Button } from "@afenda/ui/button";
import { Textarea } from "@afenda/ui/textarea";
import { useTransition } from "react";

import { decideOtmExceptionAction } from "../actions/hr.time.otm-approval.actions.server";

export type OtmExceptionInboxRow = {
  id: string;
  requestId: string;
  kind: string;
  message: string;
};

type OtmExceptionInboxTrailingProps = {
  row: OtmExceptionInboxRow;
  canDecide: boolean;
};

/** HRM-OTM-019 — exception inbox approve/reject trailing actions. */
export function OtmExceptionInboxTrailing({
  row,
  canDecide,
}: OtmExceptionInboxTrailingProps) {
  const [pending, startTransition] = useTransition();

  if (!canDecide) {
    return null;
  }

  return (
    <div className="flex min-w-48 flex-col gap-2">
      <form
        action={(formData) => {
          startTransition(async () => {
            await decideOtmExceptionAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="exceptionId" value={row.id} />
        <input type="hidden" name="decision" value="approve" />
        <Button type="submit" disabled={pending}>
          Approve exception
        </Button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            await decideOtmExceptionAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="exceptionId" value={row.id} />
        <input type="hidden" name="decision" value="reject" />
        <Textarea
          name="reason"
          rows={2}
          required
          placeholder="Required rejection reason"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          Reject exception
        </Button>
      </form>
    </div>
  );
}
