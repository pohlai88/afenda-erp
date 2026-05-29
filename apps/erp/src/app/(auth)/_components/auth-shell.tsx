import {
  appBrandName,
  authShellCopy,
  getAuthPageMetadataCopy,
  type AuthPageMetadataKey,
} from "@afenda/kernel";
import { Card, CardContent } from "@afenda/ui/card";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DevSignInFloatingPanel } from "./dev-sign-in-floating-panel";

export function createAuthPageMetadata(key: AuthPageMetadataKey): Metadata {
  const pageMetadata = getAuthPageMetadataCopy(key);

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,
  };
}

export function AuthShell({
  eyebrow = authShellCopy.hero.eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-background px-surface-2xl py-surface-3xl">
        <section className="@container grid w-full max-w-5xl overflow-hidden rounded-section border border-line bg-card shadow-elevation-1 @lg:grid-cols-[1.15fr_0.85fr]">
          <div className="@container bg-[linear-gradient(145deg,#132033_0%,#1e2f4a_55%,#a66b2d_140%)] p-8 text-white @lg:p-12">
            <div className="type-caption uppercase tracking-[0.22em] text-white/62">
              {eyebrow}
            </div>
            <h1 className="@container mt-surface-2xl max-w-md type-page-title font-semibold leading-tight @lg:text-4xl">
              {authShellCopy.hero.title}
            </h1>
            <p className="mt-5 max-w-xl type-body leading-7 text-white/78">
              {authShellCopy.hero.description}
            </p>
            <div className="mt-surface-3xl flex flex-col gap-surface-lg border-t border-white/15 pt-surface-3xl">
              <div>
                <div className="type-caption uppercase tracking-[0.18em] text-white/55">
                  {authShellCopy.hero.thisStepLabel}
                </div>
                <div className="mt-2 type-card-title font-medium text-white">
                  {title}
                </div>
                <p className="mt-2 max-w-md type-body leading-6 text-white/75">
                  {description}
                </p>
              </div>
              <ul className="flex flex-col gap-2 type-body text-white/72">
                {authShellCopy.hero.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="@container flex flex-col justify-center border-line bg-card p-8 @lg:border-l @lg:p-12">
            <Card className="border-0 bg-transparent py-0 shadow-none ring-0">
              <CardContent className="px-0">
                <div className="mx-auto w-full max-w-md">{children}</div>
              </CardContent>
            </Card>
            {footer ? (
              <div className="mx-auto mt-surface-3xl w-full max-w-md text-center type-muted">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <DevSignInFloatingPanel />
    </>
  );
}

export { appBrandName };
