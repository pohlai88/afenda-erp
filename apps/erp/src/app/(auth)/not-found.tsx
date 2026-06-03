import { authNotFoundCopy } from "@afenda/kernel";

import {
  RouteStateLinkAction,
  RouteStatePanel,
  RouteStateShell,
} from "@/routes/route-state";

export default function AuthNotFound() {
  return (
    <RouteStateShell layout="centered-auth">
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
