"use client";

import {
  updateProfileSchema,
} from "../contracts/auth.action-schemas.shared";
import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import { accountSettingsCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { neonAuthClient } from "@afenda/neon-auth/client";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
} from "../ui/auth-ui.primitives";

export function UpdateProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const copy = accountSettingsCopy.profile;

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const parsed = updateProfileSchema.parse({
          name: String(formData.get("name") || ""),
        });

        const result = await neonAuthClient.updateUser({
          name: parsed.name,
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        await neonAuthClient.getSession();
        setStatusMessage(authSuccessCopy.profileSaved);
        router.refresh();
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-surface-lg">
      <AuthFieldGroup className="gap-surface-lg">
        <AuthField id="profile-name" label={copy.nameLabel}>
          <AuthInput
            autoComplete="name"
            defaultValue={initialName}
            id="profile-name"
            name="name"
            required
          />
        </AuthField>
      </AuthFieldGroup>
      <AuthFormAlert message={errorMessage} tone="error" />
      <AuthFormAlert message={statusMessage} tone="success" />
      <AuthSubmitButton
        pending={pending}
        pendingLabel={authPendingCopy.saveProfile}
        type="submit"
      >
        {copy.submitLabel}
      </AuthSubmitButton>
    </form>
  );
}
