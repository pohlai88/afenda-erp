import type { ReactNode } from "react";

import {
  AppSubLayout,
  type AppSubLayoutProps,
} from "./appshell-sub-layout.client";

export function AppSubLayoutRsc({
  children,
  ...props
}: AppSubLayoutProps & {
  children: ReactNode;
}) {
  return <AppSubLayout {...props}>{children}</AppSubLayout>;
}
