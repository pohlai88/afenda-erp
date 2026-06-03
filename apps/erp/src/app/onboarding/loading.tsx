import { onboardingLoadingCopy } from "@afenda/kernel";

export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      className="neon-auth-ui-page surface-page flex w-full items-center justify-center p-surface-lg"
    >
      <div className="max-w-md space-y-3 text-center">
        <h1 className="type-card-title">{onboardingLoadingCopy.title}</h1>
        <p className="type-muted">
          {onboardingLoadingCopy.description}
        </p>
      </div>
    </main>
  );
}
