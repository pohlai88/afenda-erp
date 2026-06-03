import "server-only";

import { devSignInCopy } from "@afenda/kernel";
import { cn } from "@afenda/ui/utils";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
  AuthPrimaryButton,
} from "../ui/auth-ui.primitives";
import { signInAction } from "./auth.dev-actions.server";

export function DevSignInForm({
  compact = false,
  submitLabel = devSignInCopy.submitLabel,
}: {
  compact?: boolean;
  submitLabel?: string;
}) {
  return (
    <div>
      <div
        className={cn(
          "type-muted",
          compact && "type-caption uppercase tracking-wide",
        )}
      >
        {devSignInCopy.eyebrow}
      </div>
      <h2
        className={cn(
          "mt-2 font-semibold text-foreground",
          compact ? "type-card-title" : "type-section-title",
        )}
      >
        {devSignInCopy.title}
      </h2>
      <p className={cn("mt-3 type-muted", compact && "type-caption leading-5")}>
        {devSignInCopy.description}
      </p>
      <form
        action={signInAction}
        className={cn(
          "flex flex-col",
          compact ? "mt-5 gap-3" : "mt-surface-3xl gap-5",
        )}
      >
        <AuthFieldGroup className={compact ? "gap-3" : "gap-5"}>
          <AuthField id="dev-name" label={devSignInCopy.fields.name}>
            <AuthInput
              autoComplete="name"
              className={compact ? "h-9" : undefined}
              defaultValue={devSignInCopy.defaults.name}
              id="dev-name"
              name="name"
              required
            />
          </AuthField>
          <AuthField id="dev-email" label={devSignInCopy.fields.email}>
            <AuthInput
              autoComplete="email"
              className={compact ? "h-9" : undefined}
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
              className={compact ? "h-9" : undefined}
              defaultValue={devSignInCopy.defaults.organization}
              id="dev-organization"
              name="organizationName"
              required
            />
          </AuthField>
        </AuthFieldGroup>
        <AuthPrimaryButton
          className={compact ? "h-9" : undefined}
          type="submit"
        >
          {submitLabel}
        </AuthPrimaryButton>
      </form>
    </div>
  );
}
