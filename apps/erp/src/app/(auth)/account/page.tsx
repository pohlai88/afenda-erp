import type { Metadata } from "next";

import {
  PreLoginAccountNotice,
  NeonAuthAccountSettingsPage,
} from "@afenda/auth/neon-auth/pages";
import { requireNeonAuthSession } from "@afenda/auth/neon-auth/server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  await requireNeonAuthSession();
  return (
    <>
      <PreLoginAccountNotice />
      {await NeonAuthAccountSettingsPage()}
    </>
  );
}
