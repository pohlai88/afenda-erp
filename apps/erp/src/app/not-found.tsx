import { authNotFoundCopy } from "@afenda/kernel";
import type { Metadata } from "next";

import {
  RouteStateLinkAction,
  RouteStatePanel,
  RouteStateShell,
} from "@/routes/route-state";

export const metadata: Metadata = {
  title: authNotFoundCopy.title,
};

export default function RootNotFound() {
  return (
    <RouteStateShell layout="centered">
      <RouteStatePanel
        action={
          <RouteStateLinkAction href="/sign-in">
            {authNotFoundCopy.actionLabel}
          </RouteStateLinkAction>
        }
        description={authNotFoundCopy.description}
        kind="not-found"
        title={authNotFoundCopy.title}
      />
    </RouteStateShell>
  );
}
