"use client";

import { useActionState } from "react";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";

import {
  cancelHrOffboardingCaseAction,
  completeHrOffboardingCaseAction,
  completeHrOffboardingClearanceItemAction,
  decideHrOffboardingApprovalStepAction,
  markHrOffboardingSettlementReadyAction,
  updateHrOffboardingAssetStatusAction,
} from "./hr.workforce.offboarding.actions.server";
import {
  hrOffboardingApprovalsSurfaceKey,
} from "./hr.workforce.offboarding-approvals-list.surface";
import {
  hrOffboardingAssetsSurfaceKey,
} from "./hr.workforce.offboarding-assets-list.surface";
import {
  hrOffboardingCasesSurfaceKey,
} from "./hr.workforce.offboarding-cases-list.surface";
import {
  hrOffboardingClearanceSurfaceKey,
} from "./hr.workforce.offboarding-clearance-list.surface";
import {
  hrOffboardingSettlementSurfaceKey,
} from "./hr.workforce.offboarding-settlement-list.surface";

function ClearanceTrailingForm({ itemId }: { itemId: string }) {
  const [, formAction, pending] = useActionState(
    completeHrOffboardingClearanceItemAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Complete
      </Button>
    </form>
  );
}

function ApprovalTrailingForm({ stepId }: { stepId: string }) {
  const [, approveAction, approvePending] = useActionState(
    decideHrOffboardingApprovalStepAction,
    undefined,
  );

  return (
    <form action={approveAction} className="flex gap-1">
      <input type="hidden" name="stepId" value={stepId} />
      <input type="hidden" name="decision" value="approved" />
      <Button type="submit" size="sm" disabled={approvePending}>
        Approve
      </Button>
    </form>
  );
}

function AssetTrailingForm({ assetId }: { assetId: string }) {
  const [, formAction, pending] = useActionState(
    updateHrOffboardingAssetStatusAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="assetId" value={assetId} />
      <input type="hidden" name="status" value="returned" />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Returned
      </Button>
    </form>
  );
}

function CaseCompleteTrailingForm({ caseId }: { caseId: string }) {
  const [, formAction, pending] = useActionState(
    completeHrOffboardingCaseAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="caseId" value={caseId} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Complete case
      </Button>
    </form>
  );
}

function CaseCancelTrailingForm({ caseId }: { caseId: string }) {
  const [, formAction, pending] = useActionState(
    cancelHrOffboardingCaseAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="caseId" value={caseId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Cancel case
      </Button>
    </form>
  );
}

function SettlementTrailingForm({ caseId }: { caseId: string }) {
  const [, formAction, pending] = useActionState(
    markHrOffboardingSettlementReadyAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="caseId" value={caseId} />
      <Button type="submit" size="sm" disabled={pending}>
        Mark ready
      </Button>
    </form>
  );
}

export function HrOffboardingListTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const surfaceKey = context?.surfaceKey;
  const rowId = String(row.id);
  const caseId = String(row.cells.caseIdValue ?? row.id);
  const itemId = String(row.cells.itemIdValue ?? rowId);

  if (surfaceKey === hrOffboardingCasesSurfaceKey) {
    return (
      <div className="flex flex-col gap-1">
        <CaseCompleteTrailingForm caseId={caseId} />
        <CaseCancelTrailingForm caseId={caseId} />
      </div>
    );
  }
  if (surfaceKey === hrOffboardingClearanceSurfaceKey) {
    return <ClearanceTrailingForm itemId={itemId} />;
  }
  if (surfaceKey === hrOffboardingApprovalsSurfaceKey) {
    return <ApprovalTrailingForm stepId={itemId} />;
  }
  if (surfaceKey === hrOffboardingAssetsSurfaceKey) {
    return <AssetTrailingForm assetId={itemId} />;
  }
  if (surfaceKey === hrOffboardingSettlementSurfaceKey && caseId) {
    return <SettlementTrailingForm caseId={caseId} />;
  }

  return null;
}
