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
          className="min-h-24 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-slate-400"
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-muted">
          {status}
        </div>
        <button
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={disabled}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
