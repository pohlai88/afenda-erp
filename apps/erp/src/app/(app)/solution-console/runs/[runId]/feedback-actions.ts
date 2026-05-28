"use server";

import { requireCapability } from "@afenda/auth/server";
import {
  recordLynxRunFeedback,
  type LynxRunFeedbackCategory,
  type LynxRunFeedbackRating,
} from "@afenda/db";
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

function requireString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${field}.`);
  }

  return value.trim();
}

export async function recordLynxRunFeedbackAction(formData: FormData) {
  const { session, organization } = await requireCapability("dashboard.view");
  const runId = requireString(formData.get("runId"), "runId");
  const rating = requireString(formData.get("rating"), "rating");
  const category = requireString(formData.get("category"), "category");
  const note = formData.get("note");

  if (!feedbackRatings.has(rating as LynxRunFeedbackRating)) {
    throw new Error(`Invalid feedback rating: ${rating}.`);
  }

  if (!feedbackCategories.has(category as LynxRunFeedbackCategory)) {
    throw new Error(`Invalid feedback category: ${category}.`);
  }

  await recordLynxRunFeedback({
    organizationId: organization.id,
    runId,
    userAuthId: session.id,
    rating: rating as LynxRunFeedbackRating,
    category: category as LynxRunFeedbackCategory,
    note: typeof note === "string" ? note.trim().slice(0, 1000) : "",
    metadata: {
      route: "solution-console.run-detail",
    },
  });

  revalidatePath(`/solution-console/runs/${runId}`);
}
