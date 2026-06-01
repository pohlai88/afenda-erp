"use client";

import { ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge, Card, CardContent, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@afenda/ui";

import { runNetworkDiagnosisChecks, type NetworkDiagnosisRow } from "./network-diagnosis.shared";
import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

function verdictVariant(verdict: NetworkDiagnosisRow["verdict"]) {
  switch (verdict) {
    case "pass":
      return "success" as const;
    case "warn":
      return "warning" as const;
    case "fail":
      return "destructive" as const;
  }
}

export function UtilityBarDiagnosisPanel() {
  const [rows, setRows] = useState<NetworkDiagnosisRow[]>([]);

  useEffect(() => {
    void runNetworkDiagnosisChecks().then(setRows);
  }, []);

  return (
    <AppShellUtilityDropdownTemplate
      description="Local browser diagnosis for the active shell session."
      icon={<ScanSearch aria-hidden="true" size={16} />}
      title="Diagnosis"
      triggerLabel="Diagnosis"
      triggerTooltip="Open diagnosis panel"
    >
      {rows.length === 0 ? (
        <Empty className="border-border/60 p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScanSearch aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Running diagnostics</EmptyTitle>
            <EmptyDescription>Collecting browser checks for the active shell session.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-2">
          {rows.map((row) => (
            <Card className="gap-0 py-0" key={row.label} size="sm">
              <CardContent className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{row.label}</span>
                  <Badge variant={verdictVariant(row.verdict)}>
                    {row.verdict}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{row.detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShellUtilityDropdownTemplate>
  );
}
