import { onboardingFormCopy } from "@afenda/kernel";
import { completeOnboardingAction } from "./actions.server";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
  AuthPrimaryButton,
} from "@/auth/client";

export function OnboardingForm() {
  return (
    <div>
      <h2 className="type-section-title font-semibold text-foreground">
        {onboardingFormCopy.title}
      </h2>
      <p className="mt-3 type-muted">{onboardingFormCopy.description}</p>
      <form
        action={completeOnboardingAction}
        className="mt-surface-3xl flex flex-col gap-5"
      >
        <AuthFieldGroup>
          <AuthField
            id="onboarding-organization"
            label={onboardingFormCopy.organizationLabel}
          >
            <AuthInput
              autoComplete="organization"
              defaultValue={onboardingFormCopy.defaultOrganization}
              id="onboarding-organization"
              name="organizationName"
              required
            />
          </AuthField>
        </AuthFieldGroup>
        <AuthPrimaryButton type="submit">
          {onboardingFormCopy.submitLabel}
        </AuthPrimaryButton>
      </form>
    </div>
  );
}
