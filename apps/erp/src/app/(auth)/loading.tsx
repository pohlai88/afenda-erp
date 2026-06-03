import { authLoadingCopy } from "@afenda/kernel";

export default function AuthLoading() {
  return (
    <main
      aria-busy="true"
      className="neon-auth-ui-page surface-page flex w-full items-center justify-center p-surface-lg"
    >
      <div className="max-w-md space-y-3 text-center">
        <h1 className="type-card-title">{authLoadingCopy.title}</h1>
        <p className="type-muted">
          {authLoadingCopy.description}
        </p>
      </div>
    </main>
  );
}
