import {
  hrMcpResolvePayComponentTreatmentInputSchema,
  type HrMcpPayComponentTreatmentRecord,
  type HrMcpPayComponentTreatmentSnapshot,
  type HrMcpResolvedPayComponentAmounts,
  type HrMcpResolvePayComponentTreatmentInput,
} from "../schemas/hr.payroll.mcp-pay-component.schema";

function isEffectiveAt(
  effectiveFrom: Date,
  effectiveTo: Date | null | undefined,
  effectiveAt: Date,
): boolean {
  const at = effectiveAt.getTime();
  if (at < effectiveFrom.getTime()) {
    return false;
  }
  if (effectiveTo && at > effectiveTo.getTime()) {
    return false;
  }
  return true;
}

function toTreatmentSnapshot(
  record: Pick<
    HrMcpPayComponentTreatmentRecord,
    | "payComponentCode"
    | "taxTreatment"
    | "contributionTreatment"
    | "pensionTreatment"
  >,
): HrMcpPayComponentTreatmentSnapshot {
  return {
    payComponentCode: record.payComponentCode,
    taxTreatment: record.taxTreatment,
    contributionTreatment: record.contributionTreatment,
    pensionTreatment: record.pensionTreatment,
  };
}

/** MCP-007 — resolve the effective pay component treatment for a code and date. */
export function resolveEffectivePayComponentTreatment(
  payComponentCode: string,
  effectiveAt: Date,
  treatments: readonly HrMcpPayComponentTreatmentRecord[],
): HrMcpPayComponentTreatmentSnapshot | null {
  const normalized = payComponentCode.trim().toLowerCase();
  const matches = treatments
    .filter(
      (treatment) =>
        treatment.active &&
        treatment.payComponentCode.trim().toLowerCase() === normalized &&
        isEffectiveAt(treatment.effectiveFrom, treatment.effectiveTo, effectiveAt),
    )
    .sort(
      (left, right) =>
        right.effectiveFrom.getTime() - left.effectiveFrom.getTime(),
    );

  return matches[0] ? toTreatmentSnapshot(matches[0]) : null;
}

function applyTreatmentAmounts(
  amount: number,
  treatment: HrMcpPayComponentTreatmentSnapshot,
): Pick<
  HrMcpResolvedPayComponentAmounts,
  "taxableAmount" | "contributableAmount" | "pensionableAmount"
> {
  return {
    taxableAmount: treatment.taxTreatment === "taxable" ? amount : 0,
    contributableAmount:
      treatment.contributionTreatment === "contributable" ? amount : 0,
    pensionableAmount:
      treatment.pensionTreatment === "pensionable" ? amount : 0,
  };
}

/** MCP-007 — classify pay component amounts as taxable/contributable/pensionable. */
export function resolvePayComponentAmounts(
  rawInput: HrMcpResolvePayComponentTreatmentInput,
): HrMcpResolvedPayComponentAmounts {
  const input = hrMcpResolvePayComponentTreatmentInputSchema.parse(rawInput);
  const normalized = input.payComponentCode.trim().toLowerCase();
  const treatment =
    input.treatments.find(
      (entry) => entry.payComponentCode.trim().toLowerCase() === normalized,
    ) ??
    ({
      payComponentCode: input.payComponentCode,
      taxTreatment: "taxable",
      contributionTreatment: "contributable",
      pensionTreatment: "pensionable",
    } satisfies HrMcpPayComponentTreatmentSnapshot);

  const amounts = applyTreatmentAmounts(input.amount, treatment);

  return {
    payComponentCode: input.payComponentCode,
    grossAmount: input.amount,
    treatment,
    ...amounts,
  };
}

/** MCP-007 — aggregate taxable, contributable, and pensionable totals. */
export function summarizePayComponentAmounts(
  resolved: readonly HrMcpResolvedPayComponentAmounts[],
): {
  grossTotal: number;
  taxableTotal: number;
  contributableTotal: number;
  pensionableTotal: number;
} {
  return resolved.reduce(
    (acc, line) => ({
      grossTotal: acc.grossTotal + line.grossAmount,
      taxableTotal: acc.taxableTotal + line.taxableAmount,
      contributableTotal: acc.contributableTotal + line.contributableAmount,
      pensionableTotal: acc.pensionableTotal + line.pensionableAmount,
    }),
    {
      grossTotal: 0,
      taxableTotal: 0,
      contributableTotal: 0,
      pensionableTotal: 0,
    },
  );
}
