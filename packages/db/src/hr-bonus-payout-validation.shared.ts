/** HRM-BON-020 data-quality flags surfaced before payout finalization. */
export const HR_BONUS_PAYOUT_VALIDATION_FLAGS = [
  "missing_target",
  "missing_achievement",
  "incomplete_performance_rating",
  "invalid_payout_formula",
  "ineligible_employee",
  "participant_not_assigned",
] as const;

export type HrBonusPayoutValidationFlag =
  (typeof HR_BONUS_PAYOUT_VALIDATION_FLAGS)[number];

export const HR_BONUS_BLOCKING_VALIDATION_FLAGS: readonly HrBonusPayoutValidationFlag[] =
  [
    "missing_target",
    "missing_achievement",
    "incomplete_performance_rating",
    "invalid_payout_formula",
    "ineligible_employee",
    "participant_not_assigned",
  ];

export type HrBonusPayoutValidationResult = {
  flags: readonly HrBonusPayoutValidationFlag[];
  blocking: boolean;
};

export function hasBlockingBonusValidationFlags(
  flags: readonly HrBonusPayoutValidationFlag[],
): boolean {
  return flags.some((flag) =>
    HR_BONUS_BLOCKING_VALIDATION_FLAGS.includes(flag),
  );
}
