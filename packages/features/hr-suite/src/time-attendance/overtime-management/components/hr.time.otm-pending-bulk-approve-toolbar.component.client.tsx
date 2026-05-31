"use client";

import { Button } from "@afenda/ui/button";
import { useTransition } from "react";

import { bulkApproveOtmRequestsAction } from "../actions/hr.time.otm-approval.actions.server";

type OtmPendingBulkApproveToolbarProps = {
  selectedRequestIds: readonly string[];
  canBulkApprove: boolean;
};

/** bulk-016 — bulk approve selected pending requests (max 25). */
export function OtmPendingBulkApproveToolbar({
  selectedRequestIds,
  canBulkApprove,
}: OtmPendingBulkApproveToolbarProps) {
  const [pending, startTransition] = useTransition();

  if (!canBulkApprove || selectedRequestIds.length === 0) {
    return null;
  }

  const cappedIds = selectedRequestIds.slice(0, 25);

  return (
    <div className="flex items-center gap-2">
      <span className="type-caption">
        {cappedIds.length} selected (max 25)
      </span>
      <Button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await bulkApproveOtmRequestsAction({ requestIds: cappedIds });
          });
        }}
      >
        Bulk approve
      </Button>
    </div>
  );
}
