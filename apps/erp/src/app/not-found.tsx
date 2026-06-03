import { authNotFoundCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: authNotFoundCopy.title,
};

export default function RootNotFound() {
  return (
    <main className="surface-page flex w-full items-center justify-center p-surface-lg">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="type-card-title">{authNotFoundCopy.title}</h1>
        <p className="type-muted">
          {authNotFoundCopy.description}
        </p>
        <Link
          className="type-control text-primary underline-offset-4 hover:underline"
          href="/sign-in"
        >
          {authNotFoundCopy.actionLabel}
        </Link>
      </div>
    </main>
  );
}
