export type HrDocumentEffectiveVerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired";

export function deriveHrDocumentEffectiveVerificationStatus(input: {
  verificationStatus: string;
  effectiveTo: Date | null;
  now?: Date;
}): HrDocumentEffectiveVerificationStatus {
  const now = input.now ?? new Date();
  if (
    input.effectiveTo &&
    input.effectiveTo.getTime() <= now.getTime() &&
    input.verificationStatus !== "rejected"
  ) {
    return "expired";
  }
  if (
    input.verificationStatus === "pending" ||
    input.verificationStatus === "verified" ||
    input.verificationStatus === "rejected"
  ) {
    return input.verificationStatus;
  }
  return "pending";
}

export type HrDocumentExpiryPosture = "current" | "expiring" | "expired";

export function deriveHrDocumentExpiryPosture(input: {
  effectiveTo: Date | null;
  now?: Date;
  expiringWithinDays?: number;
}): HrDocumentExpiryPosture {
  if (!input.effectiveTo) {
    return "current";
  }
  const now = input.now ?? new Date();
  if (input.effectiveTo.getTime() <= now.getTime()) {
    return "expired";
  }
  const horizon = new Date(now);
  horizon.setUTCDate(
    horizon.getUTCDate() + Math.max(0, input.expiringWithinDays ?? 14),
  );
  if (input.effectiveTo.getTime() <= horizon.getTime()) {
    return "expiring";
  }
  return "current";
}
