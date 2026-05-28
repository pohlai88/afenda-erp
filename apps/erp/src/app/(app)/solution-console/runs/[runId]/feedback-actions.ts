"use server";

import { requireCapability } from "@afenda/auth/server";
import {
  recordLynxRunFeedback,
  type LynxRunFeedbackCategory,
  type LynxRunFeedbackRating,
} from "@afenda/db";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";

const feedbackRatings = new Set<LynxRunFeedbackRating>([
  "positive",
  "negative",
]);
const feedbackCategories = new Set<LynxRunFeedbackCategory>([
  "accurate",
  "unsupported",
  "wrong-tool",
  "slow",
  "unsafe",
  "other",
]);

function readRequiredString(
  value: FormDataEntryValue | null,
  field: string,
): string | ActionResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return actionFailure(`Missing ${field}.`, { [field]: `Enter ${field}.` });
  }

  return value.trim();
}

export async function recordLynxRunFeedbackAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { session, organization } = await requireCapability("dashboard.view");

    const runIdValue = readRequiredString(formData.get("runId"), "runId");
    if (typeof runIdValue !== "string") {
      return runIdValue;
    }

    const ratingValue = readRequiredString(formData.get("rating"), "rating");
    if (typeof ratingValue !== "string") {
      return ratingValue;
    }

    const categoryValue = readRequiredString(formData.get("category"), "category");
    if (typeof categoryValue !== "string") {
      return categoryValue;
    }

    const note = formData.get("note");

    if (!feedbackRatings.has(ratingValue as LynxRunFeedbackRating)) {
      return actionFailure("Invalid feedback rating.", {
        rating: "Choose a valid rating.",
      });
    }

    if (!feedbackCategories.has(categoryValue as LynxRunFeedbackCategory)) {
      return actionFailure("Invalid feedback category.", {
        category: "Choose a valid category.",
      });
    }

    await recordLynxRunFeedback({
      organizationId: organization.id,
      runId: runIdValue,
      userAuthId: session.id,
      rating: ratingValue as LynxRunFeedbackRating,
      category: categoryValue as LynxRunFeedbackCategory,
      note: typeof note === "string" ? note.trim().slice(0, 1000) : "",
      metadata: {
        route: "solution-console.run-detail",
      },
    });

    revalidatePath(`/solution-console/runs/${runIdValue}`);
    return actionSuccess();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save feedback.";
    return actionFailure(message);
  }
}
