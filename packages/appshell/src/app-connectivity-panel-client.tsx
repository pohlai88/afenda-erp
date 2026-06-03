"use client";

import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge, Card, CardContent, Separator } from "@afenda/ui";

import { AppShellUtilityDropdownTemplate } from "./app-utility-dropdown-template-client";

type ConnectivityState = {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
};

function readConnectivityState(): ConnectivityState {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }
  ).connection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

export function UtilityBarConnectivityPanel() {
  const [state, setState] = useState<ConnectivityState | null>(null);

  useEffect(() => {
    const sync = () => setState(readConnectivityState());
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <AppShellUtilityDropdownTemplate
      description="Live browser connection state and estimated network quality."
      icon={<Wifi aria-hidden="true" size={16} />}
      title="Connectivity"
      triggerLabel="Connectivity"
      triggerTooltip="Open connectivity panel"
    >
      <Card className="gap-0 py-0" size="sm">
        <CardContent className="grid gap-0 px-0 py-0">
          <div className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="font-medium">Status</span>
            <Badge variant={state?.online ? "success" : "warning"}>
              {state?.online ? "Online" : "Offline"}
            </Badge>
          </div>
          {state?.effectiveType ? (
            <>
              <Separator />
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Profile</span>
                <span>{state.effectiveType}</span>
              </div>
            </>
          ) : null}
          {typeof state?.downlink === "number" ? (
            <>
              <Separator />
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Downlink</span>
                <span>{state.downlink} Mbps</span>
              </div>
            </>
          ) : null}
          {typeof state?.rtt === "number" ? (
            <>
              <Separator />
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>RTT</span>
                <span>{state.rtt} ms</span>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </AppShellUtilityDropdownTemplate>
  );
}
