"use client";

import { Database } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@afenda/ui";

import { browserStorageAvailable } from "./browser-runtime.shared";
import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

type StorageKind = "localStorage" | "sessionStorage";

function readStorageRows(kind: StorageKind) {
  if (!browserStorageAvailable(kind)) {
    return [];
  }

  const storage = window[kind];
  return Array.from({ length: storage.length }, (_, index) => {
    const key = storage.key(index) ?? "";
    const value = storage.getItem(key) ?? "";
    return { key, value };
  }).filter((row) => row.key.length > 0);
}

export function UtilityBarStoragePanel() {
  const [kind, setKind] = useState<StorageKind>("localStorage");
  const rows = useMemo(() => readStorageRows(kind), [kind]);

  return (
    <AppShellUtilityDropdownTemplate
      description="Inspect browser storage attached to the current origin."
      icon={<Database aria-hidden="true" size={16} />}
      title="Storage"
      triggerLabel="Storage"
      triggerTooltip="Open storage panel"
    >
      <div className="flex gap-2">
        <Button onClick={() => setKind("localStorage")} size="sm" type="button" variant={kind === "localStorage" ? "default" : "outline"}>
          Local
        </Button>
        <Button onClick={() => setKind("sessionStorage")} size="sm" type="button" variant={kind === "sessionStorage" ? "default" : "outline"}>
          Session
        </Button>
      </div>
      <div className="grid max-h-56 gap-2 overflow-auto">
        {rows.length === 0 ? (
          <Empty className="border-border/60 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Database aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No keys found</EmptyTitle>
              <EmptyDescription>
                The selected browser storage area is currently empty for this origin.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          rows.map((row) => (
            <Card className="gap-0 py-0" key={row.key} size="sm">
              <CardContent className="px-3 py-2">
                <div className="font-mono text-xs font-medium">{row.key}</div>
                <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {row.value.slice(0, 160)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
