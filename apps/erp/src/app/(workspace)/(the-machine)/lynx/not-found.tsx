import { LYNX_WORKSPACE_ROUTES } from "@afenda/feature-lynx/server";

import {
  RouteStateLinkAction,
  RouteStatePanel,
  RouteStateShell,
} from "@/routes/route-state";

export default function LynxNotFound() {
  return (
    <RouteStateShell layout="workspace">
      <RouteStatePanel
        action={
          <RouteStateLinkAction href={LYNX_WORKSPACE_ROUTES.console}>
            Return to Lynx
          </RouteStateLinkAction>
        }
        align="start"
        description="The requested run or workflow session does not exist in the active organization."
        kind="not-found"
        label="Lynx"
        title="Lynx record not found"
      />
    </RouteStateShell>
  );
}
