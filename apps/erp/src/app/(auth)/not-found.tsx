import { authNotFoundCopy } from "@afenda/kernel";
import Link from "next/link";

export default function AuthNotFound() {
  return (
    <main className="neon-auth-ui-page flex min-h-[50vh] w-full items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">{authNotFoundCopy.title}</h1>
        <p className="text-sm text-muted-foreground">
          {authNotFoundCopy.description}
        </p>
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href="/sign-in"
        >
          {authNotFoundCopy.actionLabel}
        </Link>
      </div>
    </main>
  );
}
