"use client";

import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { Label } from "@afenda/ui/label";
import { Textarea } from "@afenda/ui/textarea";
import { useTransition } from "react";

import {
  adjustOtmRequestAction,
  approveOtmRequestAction,
  rejectOtmRequestAction,
  returnOtmRequestAction,
} from "./hr.time.otm-approval.actions.server";

type OtmDecisionFormsProps = {
  requestId: string;
  canDecide: boolean;
};

/** HRM-OTM-017/018 — pending inbox trailing approve/reject/return/adjust. */
export function OtmDecisionForms({ requestId, canDecide }: OtmDecisionFormsProps) {
  const [pending, startTransition] = useTransition();

  if (!canDecide) {
    return null;
  }

  return (
    <div className="flex min-w-56 flex-col gap-surface-md">
      <form
        action={(formData) => {
          startTransition(async () => {
            await approveOtmRequestAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <Label htmlFor={`${requestId}-approve-note`}>Approval note</Label>
        <Textarea
          id={`${requestId}-approve-note`}
          name="decisionNote"
          rows={2}
          placeholder="Optional approval note"
        />
        <Button type="submit" disabled={pending}>
          Approve
        </Button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            await adjustOtmRequestAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <Label htmlFor={`${requestId}-adjust-hours`}>Adjusted hours</Label>
        <Input
          id={`${requestId}-adjust-hours`}
          name="adjustedHours"
          type="number"
          step="0.25"
          min="0.25"
          max="24"
          required
        />
        <Label htmlFor={`${requestId}-adjust-reason`}>Adjust reason</Label>
        <Textarea
          id={`${requestId}-adjust-reason`}
          name="adjustReason"
          rows={2}
          required
          placeholder="Required adjustment reason"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          Adjust
        </Button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            await returnOtmRequestAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <Label htmlFor={`${requestId}-return-reason`}>Return reason</Label>
        <Textarea
          id={`${requestId}-return-reason`}
          name="returnReason"
          rows={2}
          required
          placeholder="Required return reason"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          Return
        </Button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            await rejectOtmRequestAction(undefined, formData);
          });
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="requestId" value={requestId} />
        <Label htmlFor={`${requestId}-reject-reason`}>Rejection reason</Label>
        <Textarea
          id={`${requestId}-reject-reason`}
          name="rejectionReason"
          rows={2}
          required
          placeholder="Required rejection reason"
        />
        <Button type="submit" variant="destructive" disabled={pending}>
          Reject
        </Button>
      </form>
    </div>
  );
}
