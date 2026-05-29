import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import type { SystemAdminPolicyRuleDetail } from "../contracts/system-admin.policy-rule.contract";
import { systemAdminPoliciesUiCopy } from "../surface/system-admin.policies-ui.copy.shared";
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
  const copy = systemAdminPoliciesUiCopy.detail;
  const fields = copy.fields;

  return (
    <Card data-testid={`system-admin-policy-detail:${detail.policyKey}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-surface-md">
        <CardTitle>{detail.name}</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>{copy.backLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent className="@container flex flex-col gap-surface-md type-body">
        <dl className="grid gap-2 @sm:grid-cols-2">
          <div>
            <dt className="type-muted">{fields.policyKey}</dt>
            <dd className="type-mono-cell">{detail.policyKey}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.module}</dt>
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
            <dt className="type-muted">{fields.effect}</dt>
            <dd>{detail.effect}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.status}</dt>
            <dd>{detail.status}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.priority}</dt>
            <dd>{detail.priority}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.readiness}</dt>
            <dd>{detail.readinessVerdict}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.coverage}</dt>
            <dd>{detail.coverageSummary}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.action}</dt>
            <dd className="type-mono-cell">{detail.action}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.capability}</dt>
            <dd>
              {detail.capabilityKey ? (
                <Link
                  href={systemAdminControlLinks.capabilities(detail.capabilityKey)}
                  className="underline-offset-4 hover:underline"
                >
                  {detail.capabilityLabel ?? detail.capabilityKey}
                </Link>
              ) : (
                copy.noCapability
              )}
            </dd>
          </div>
          {detail.requiredPermission ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.requiredPermission}</dt>
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
              <dt className="type-muted">{fields.relatedApprovals}</dt>
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
          <p className="mb-2 type-muted">{copy.conditionTitle}</p>
          <pre className="max-h-96 overflow-auto rounded-control border border-border bg-muted/30 p-3 type-mono-cell">
            {detail.conditionJson}
          </pre>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href={detail.auditHref}>{copy.auditHistoryLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
