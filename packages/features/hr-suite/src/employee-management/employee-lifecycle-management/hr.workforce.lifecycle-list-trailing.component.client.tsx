"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";

import {
  cancelHrLifecycleTransitionAction,
  changeHrEmploymentStatusAction,
  recordHrProbationOutcomeAction,
  renewHrEmployeeContractAction,
  startHrOffboardingCaseAction,
} from "./hr.workforce.lifecycle.actions.server";
import { hrLifecycleOverviewSurfaceKey } from "./hr.workforce.lifecycle-overview-list.surface";
import { hrLifecyclePendingTransitionsSurfaceKey } from "./hr.workforce.lifecycle-pending-transitions-list.surface";
import { hrLifecycleProbationDueSurfaceKey } from "./hr.workforce.lifecycle-probation-due-list.surface";
import { hrLifecycleContractReviewsSurfaceKey } from "./hr.workforce.lifecycle-contract-reviews-list.surface";
import { hrLifecycleNoticePeriodSurfaceKey } from "./hr.workforce.lifecycle-notice-period-list.surface";
import {
  HrLifecycleContractRenewalTrailingForm,
  HrLifecycleNoticePeriodOffboardingTrailingForm,
  HrLifecycleOverviewScheduleTrailingForm,
  HrLifecyclePendingTransitionCancelTrailingForm,
  HrLifecycleProbationOutcomeTrailingForm,
} from "./hr.workforce.lifecycle-list-trailing-form.component.client";

export function HrLifecycleOverviewTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrLifecycleOverviewSurfaceKey
  ) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot>
      <HrLifecycleOverviewScheduleTrailingForm
        row={props.row}
        action={changeHrEmploymentStatusAction}
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrLifecycleNoticePeriodTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrLifecycleNoticePeriodSurfaceKey
  ) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot>
      <HrLifecycleNoticePeriodOffboardingTrailingForm
        row={props.row}
        action={startHrOffboardingCaseAction}
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrLifecycleProbationDueTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrLifecycleProbationDueSurfaceKey
  ) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot>
      <HrLifecycleProbationOutcomeTrailingForm
        row={props.row}
        action={recordHrProbationOutcomeAction}
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrLifecycleContractReviewsTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrLifecycleContractReviewsSurfaceKey
  ) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot>
      <HrLifecycleContractRenewalTrailingForm
        row={props.row}
        action={renewHrEmployeeContractAction}
      />
    </GovernedTrailingActionSlot>
  );
}

export function HrLifecyclePendingTransitionsTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrLifecyclePendingTransitionsSurfaceKey
  ) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot>
      <HrLifecyclePendingTransitionCancelTrailingForm
        row={props.row}
        action={cancelHrLifecycleTransitionAction}
      />
    </GovernedTrailingActionSlot>
  );
}
