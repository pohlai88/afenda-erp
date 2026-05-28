import { onboardingFormCopy } from "@afenda/kernel";
import { completeOnboardingAction } from "./actions";
import {
  AuthField,
  AuthInput,
  AuthPrimaryButton,
} from "../(auth)/_components/auth-ui";

export function OnboardingForm() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">
        {onboardingFormCopy.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {onboardingFormCopy.description}
      </p>
      <form action={completeOnboardingAction} className="mt-8 flex flex-col gap-5">
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
        <AuthPrimaryButton type="submit">
          {onboardingFormCopy.submitLabel}
        </AuthPrimaryButton>
      </form>
    </div>
  );
}
