import type { ReactNode } from "react";

import type { AppShellChrome } from "../contracts";
import { AppShellClient } from "./appshell.client";

export interface AppShellProps {
  chrome: AppShellChrome;
  children: ReactNode;
}

export function AppShell({ chrome, children }: AppShellProps) {
  return <AppShellClient chrome={chrome}>{children}</AppShellClient>;
}
