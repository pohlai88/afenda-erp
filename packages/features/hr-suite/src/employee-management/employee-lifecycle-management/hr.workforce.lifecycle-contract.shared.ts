export type HrLifecycleContractReviewPosture =
  | "expired"
  | "due"
  | "upcoming";

export function deriveContractReviewPosture(
  contractEndDate: Date,
  asOf: Date = new Date(),
): HrLifecycleContractReviewPosture {
  if (contractEndDate < asOf) {
    return "expired";
  }

  const dueHorizon = new Date(asOf);
  dueHorizon.setDate(dueHorizon.getDate() + 30);

  return contractEndDate <= dueHorizon ? "due" : "upcoming";
}
