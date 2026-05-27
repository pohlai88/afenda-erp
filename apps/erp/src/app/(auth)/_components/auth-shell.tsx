import {
  appBrandName,
  authShellCopy,
  getAuthPageMetadataCopy,
  type AuthPageMetadataKey,
} from "@afenda/domain";
import { Card, CardContent } from "@afenda/ui/card";
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-line bg-card shadow-sm lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-[linear-gradient(145deg,#132033_0%,#1e2f4a_55%,#a66b2d_140%)] p-8 text-white lg:p-12">
          <div className="text-xs uppercase tracking-[0.22em] text-white/62">
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-md text-3xl font-semibold leading-tight lg:text-4xl">
            {authShellCopy.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/78">
            {authShellCopy.hero.description}
          </p>
          <div className="mt-10 space-y-4 border-t border-white/15 pt-8">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                {authShellCopy.hero.thisStepLabel}
              </div>
              <div className="mt-2 text-lg font-medium text-white">{title}</div>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                {description}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-white/72">
              {authShellCopy.hero.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-center border-line bg-card p-8 lg:border-l lg:p-12">
          <Card className="border-0 bg-transparent py-0 shadow-none ring-0">
            <CardContent className="px-0">
              <div className="mx-auto w-full max-w-md">{children}</div>
            </CardContent>
          </Card>
          {footer ? (
            <div className="mx-auto mt-8 w-full max-w-md text-center text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export { appBrandName };
