import { devSignInCopy } from "@afenda/domain";
import { signInAction } from "../actions";
import { AuthField, AuthInput, AuthPrimaryButton } from "./auth-ui";

export function DevSignInForm() {
  return (
    <div>
      <div className="text-sm text-muted-foreground">
        {devSignInCopy.eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-foreground">
        {devSignInCopy.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {devSignInCopy.description}
      </p>
      <form action={signInAction} className="mt-8 space-y-5">
        <AuthField id="dev-name" label={devSignInCopy.fields.name}>
          <AuthInput
            autoComplete="name"
            defaultValue={devSignInCopy.defaults.name}
            id="dev-name"
            name="name"
            required
          />
        </AuthField>
        <AuthField id="dev-email" label={devSignInCopy.fields.email}>
          <AuthInput
            autoComplete="email"
            defaultValue={devSignInCopy.defaults.email}
            id="dev-email"
            name="email"
            required
            type="email"
          />
        </AuthField>
        <AuthField
          id="dev-organization"
          label={devSignInCopy.fields.organization}
        >
          <AuthInput
            autoComplete="organization"
            defaultValue={devSignInCopy.defaults.organization}
            id="dev-organization"
            name="organizationName"
            required
          />
        </AuthField>
        <AuthPrimaryButton type="submit">
          {devSignInCopy.submitLabel}
        </AuthPrimaryButton>
      </form>
    </div>
  );
}
