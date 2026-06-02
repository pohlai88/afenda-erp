"use server";

import { organizationOnboardingSchema } from "@afenda/auth";
import { bootstrapCurrentUserOrganization } from "@afenda/auth/server";
import { redirect } from "next/navigation";

export async function completeOnboardingAction(formData: FormData) {
  const parsed = organizationOnboardingSchema.parse({
    organizationName: String(formData.get("organizationName") || ""),
  });

  await bootstrapCurrentUserOrganization(parsed.organizationName);
  redirect("/dashboard");
}
