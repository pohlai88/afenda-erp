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
  startHrOffboardingCaseAction,
} from "../actions/hr.workforce.lifecycle.actions.server";
import { hrLifecycleOverviewSurfaceKey } from "../surface/hr.workforce.lifecycle-overview-list.surface";
import { hrLifecyclePendingTransitionsSurfaceKey } from "../surface/hr.workforce.lifecycle-pending-transitions-list.surface";
import { hrLifecycleProbationDueSurfaceKey } from "../surface/hr.workforce.lifecycle-probation-due-list.surface";
import { hrLifecycleNoticePeriodSurfaceKey } from "../surface/hr.workforce.lifecycle-notice-period-list.surface";
import {
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
