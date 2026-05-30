"use client";

import type { FormEvent } from "react";

export function PromptInput({
  disabled,
  onSubmit,
  onValueChange,
  placeholder,
  status,
  value,
}: {
  disabled?: boolean;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  status: string;
  value: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="border-t border-line p-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="sr-only">Ask the ERP assistant</span>
        <textarea
          className="min-h-24 w-full resize-y rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-ring"
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="type-caption uppercase tracking-wide">
          {status}
        </div>
        <button
          className="rounded-section bg-primary px-surface-lg py-2 type-body font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
