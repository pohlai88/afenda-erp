"use client";

import { cn } from "@afenda/ui/utils";
import { evaluatePasswordPolicy } from "../policy/password-policy.shared";

export function PasswordRequirementList({
  password,
  id,
}: {
  password: string;
  id?: string;
}) {
  const requirements = evaluatePasswordPolicy(password);

  return (
    <div
      aria-live="polite"
      className="rounded-section border border-line bg-surface-inset px-surface-md py-surface-md"
      id={id}
    >
      <p className="type-label text-muted-foreground">Password requirements</p>
      <ul className="mt-2 flex flex-col gap-1">
        {requirements.map((requirement) => (
          <li
            className={cn(
              "flex items-center gap-2 type-caption",
              requirement.met ? "text-success" : "text-muted-foreground",
            )}
            key={requirement.key}
          >
            <span aria-hidden>{requirement.met ? "OK" : "-"}</span>
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 type-caption text-muted-foreground">
        {password.length}/128 characters
      </p>
    </div>
  );
}
