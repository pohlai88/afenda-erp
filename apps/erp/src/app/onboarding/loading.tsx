import { onboardingLoadingCopy } from "@afenda/kernel";

export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      className="neon-auth-ui-page flex min-h-[50vh] w-full items-center justify-center p-6"
    >
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">{onboardingLoadingCopy.title}</h1>
        <p className="text-sm text-muted-foreground">
          {onboardingLoadingCopy.description}
        </p>
      </div>
    </main>
  );
}
