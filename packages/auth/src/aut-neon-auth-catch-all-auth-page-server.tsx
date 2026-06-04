import "server-only";

import { connection } from "next/server";
import { notFound } from "next/navigation";

import { NeonAuthUiAuthPage } from "./aut-neon-auth-ui-auth-page-client";
import { NeonAuthUiPageGate } from "./aut-neon-auth-ui-page-gate-server";
import {
  isNeonAuthUiAuthViewPath,
  neonAuthUiAuthGenerateStaticParams,
} from "./aut-neon-auth-ui-routes-shared";

export { neonAuthUiAuthGenerateStaticParams as generateStaticParams };

export const dynamicParams = false;

export type NeonAuthCatchAllAuthPageProps = {
  params: Promise<{ path: string }>;
};

/**
 * Optional catch-all for `app/auth/[path]/page.tsx` (Neon quickstart layout).
 * Afenda ERP uses flat `(auth)` routes — prefer `NeonAuthSignInPage` etc.
 */
export async function NeonAuthCatchAllAuthPage({ params }: NeonAuthCatchAllAuthPageProps) {
  await connection();
  const { path } = await params;

  if (!isNeonAuthUiAuthViewPath(path)) {
    notFound();
  }

  return (
    <NeonAuthUiPageGate>
      <NeonAuthUiAuthPage view={path} />
    </NeonAuthUiPageGate>
  );
}
