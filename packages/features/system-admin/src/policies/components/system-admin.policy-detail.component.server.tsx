import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import type { SystemAdminPolicyRuleDetail } from "../contracts/system-admin.policy-rule.contract";
import { Button } from "@afenda/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import Link from "next/link";

export function SystemAdminPolicyDetailPanel({
  detail,
  backHref,
}: {
  detail: SystemAdminPolicyRuleDetail;
  backHref: string;
}) {
  return (
    <Card data-testid={`system-admin-policy-detail:${detail.policyKey}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-surface-md">
        <CardTitle>{detail.name}</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>Back to catalog</Link>
        </Button>
      </CardHeader>
      <CardContent className="@container flex flex-col gap-surface-md type-body">
        <dl className="grid gap-2 @sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Policy key</dt>
            <dd className="type-mono-cell">{detail.policyKey}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Module</dt>
            <dd>
              <Link
                href={systemAdminControlLinks.modules(detail.moduleKey)}
                className="underline-offset-4 hover:underline"
              >
                {detail.moduleKey}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Effect</dt>
            <dd>{detail.effect}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{detail.status}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Priority</dt>
            <dd>{detail.priority}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Readiness</dt>
            <dd>{detail.readinessVerdict}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Coverage</dt>
            <dd>{detail.coverageSummary}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="text-muted-foreground">Action</dt>
            <dd className="type-mono-cell">{detail.action}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="text-muted-foreground">Capability</dt>
            <dd>
              {detail.capabilityKey ? (
                <Link
                  href={systemAdminControlLinks.capabilities(detail.capabilityKey)}
                  className="underline-offset-4 hover:underline"
                >
                  {detail.capabilityLabel ?? detail.capabilityKey}
                </Link>
              ) : (
                "No registered execution capability"
              )}
            </dd>
          </div>
          {detail.requiredPermission ? (
            <div className="@sm:col-span-2">
              <dt className="text-muted-foreground">Required permission</dt>
              <dd>
                <Link
                  href={systemAdminControlLinks.permissions(
                    detail.requiredPermission,
                  )}
                  className="type-mono-cell underline-offset-4 hover:underline"
                >
                  {detail.requiredPermission}
                </Link>
              </dd>
            </div>
          ) : null}
          {detail.relatedApprovalKeys.length > 0 ? (
            <div className="@sm:col-span-2">
              <dt className="text-muted-foreground">Related approval rules</dt>
              <dd className="flex flex-col gap-1">
                {detail.relatedApprovalKeys.map((approvalKey) => (
                  <Link
                    key={approvalKey}
                    href={systemAdminControlLinks.approvals(approvalKey)}
                    className="type-mono-cell underline-offset-4 hover:underline"
                  >
                    {approvalKey}
                  </Link>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
        <div>
          <p className="mb-2 text-muted-foreground">Policy condition</p>
          <pre className="max-h-96 overflow-auto rounded-control border border-border bg-muted/30 p-3 type-mono-cell">
            {detail.conditionJson}
          </pre>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href={detail.auditHref}>View policy audit history</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
