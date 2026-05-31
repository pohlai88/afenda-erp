"use server";

import { attachHrExpenseClaimReceipt, HrExpenseCommandError } from "@afenda/db";
import { type ActionResult, zodActionFailure } from "@afenda/governed-surface/schemas";

import { requireHrExpenseWrite } from "../policies/hr.payroll.expense-access.policy.server";
import { attachHrExpenseClaimReceiptFormSchema } from "../schemas/hr.payroll.expense-receipt.schema";
import { finalizeHrExpenseMutation } from "./hr.payroll.expense.mutation.shared.server";

function readExpenseFormField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (value === null) {
    return undefined;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

/** HRM-EXP-003 — attach receipt / invoice / proof after blob upload. */
export async function attachHrExpenseClaimReceiptAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { organization, session } = await requireHrExpenseWrite();

  const parsed = attachHrExpenseClaimReceiptFormSchema.safeParse({
    claimId: readExpenseFormField(formData, "claimId"),
    employeeId: readExpenseFormField(formData, "employeeId"),
    kind: readExpenseFormField(formData, "kind"),
    title: readExpenseFormField(formData, "title"),
    blobUrl: readExpenseFormField(formData, "blobUrl"),
    pathname: readExpenseFormField(formData, "pathname"),
    contentType: readExpenseFormField(formData, "contentType"),
    sizeBytes: readExpenseFormField(formData, "sizeBytes"),
    blobEtag: readExpenseFormField(formData, "blobEtag"),
    lineItemId: readExpenseFormField(formData, "lineItemId"),
    receiptDate: readExpenseFormField(formData, "receiptDate"),
    merchantName: readExpenseFormField(formData, "merchantName"),
    amountCents: readExpenseFormField(formData, "amountCents"),
    currencyCode: readExpenseFormField(formData, "currencyCode"),
    externalReference: readExpenseFormField(formData, "externalReference"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrExpenseMutation(async () => {
    try {
      await attachHrExpenseClaimReceipt({
        organizationId: organization.id,
        uploadedByAuthUserId: session.id,
        ...parsed.data,
        receiptDate: parsed.data.receiptDate
          ? new Date(`${parsed.data.receiptDate}T00:00:00.000Z`)
          : null,
      });
    } catch (error) {
      if (error instanceof HrExpenseCommandError) {
        throw error;
      }
      throw error;
    }
  });
}
