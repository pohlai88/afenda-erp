### 9.12 Integrations

## Definition

Integrations manages the connection between Afenda and external systems.

It provides the governance surface for enabling, reviewing, configuring, monitoring, and controlling external system access.

Integrations does not execute business operations.

Integrations does not bypass ERP security.

Integrations defines how external systems may interact with organizational data and services.

The Execution Kernel remains responsible for enforcing access and sensitive execution rules.

## Owns

Integrations owns:

* integration enablement
* integration credentials visibility policy
* webhook settings
* external system connection status
* integration governance review
* integration health monitoring
* integration trust configuration
* integration access review
* integration readiness review
* integration audit visibility

## Does Not Own

Integrations does not own:

* permission enforcement
* policy enforcement
* authentication implementation
* business workflow execution
* ERP module business logic
* audit event generation
* external vendor implementation

Those belong to:

```txt
Execution Kernel
Policies
Security
Audit
Feature Modules
Platform/Auth
```

## Example Permission

```txt
system_admin.integrations.manage
```

Recommended split:

```txt
system_admin.integrations.read
system_admin.integrations.manage
system_admin.integrations.review
```

Phase 4 minimum:

```txt
system_admin.integrations.read
system_admin.integrations.manage
```

## Core Principle

Integrations answers:

```txt
Which external systems are trusted,
connected,
and allowed to interact with this organization?
```

Not:

```txt
How does the integration execute internally?
```

## Integration Model

```ts
export type OrganizationIntegration = {
  id: string

  organizationId: string

  key: string

  name: string

  category:
    | "identity"
    | "finance"
    | "communication"
    | "storage"
    | "commerce"
    | "analytics"
    | "custom"

  status:
    | "enabled"
    | "disabled"
    | "error"
    | "preview"

  connectionStatus:
    | "connected"
    | "disconnected"
    | "error"
    | "unknown"

  createdAt: Date
  updatedAt: Date
}
```

## Integration Categories

### Identity

Examples:

```txt
Google Workspace
Microsoft Entra ID
Okta
```

### Communication

Examples:

```txt
Email Provider
WhatsApp
Slack
Microsoft Teams
```

### Finance

Examples:

```txt
Bank Feeds
Payment Gateway
Accounting Connector
```

### Storage

Examples:

```txt
Google Drive
SharePoint
Dropbox
S3
```

### Commerce

Examples:

```txt
Shopify
WooCommerce
Lazada
Shopee
```

### Analytics

Examples:

```txt
Power BI
Looker
Tableau
```

## Integration Relationship

```txt
Integration
  ↓

Credentials
  ↓

Webhook
  ↓

Execution Kernel
  ↓

ERP Module
```

Important:

```txt
Integration never bypasses Execution Kernel.
```

## Integrations Page

Route:

```txt
/apps/system-admin/integrations
```

Purpose:

```txt
Review external system connectivity and governance.
```

Recommended columns:

```txt
Integration
Category
Status
Connection
Last Sync
Webhook
Readiness
Actions
```

## Integration Detail View

Should show:

```txt
Integration metadata
Connection status
Webhook status
Credential visibility policy
Recent activity
Recent failures
Audit history
Readiness report
```

This becomes the external-system truth page.

## Credential Visibility Policy

Purpose:

```txt
Control who may view or manage credentials.
```

Rules:

```txt
Credentials should never be displayed in plain text.

Secrets should be masked.

Only authorized administrators may rotate or replace credentials.
```

Example:

```txt
API Key

*************AB12
```

Not:

```txt
sk_live_1234567890abcdef
```

## Webhook Configuration

Owns:

```txt
Webhook endpoints
Webhook status
Webhook retry policy
Webhook secret rotation
Webhook health
```

Example:

```txt
Endpoint:
  /api/integrations/shopify

Status:
  Healthy

Retries:
  3
```

## Connection Status

Recommended statuses:

```txt
Connected
Disconnected
Error
Unknown
```

Examples:

```txt
Shopify
  Connected

Bank Feed
  Error

Slack
  Disconnected
```

## Integration Readiness

```ts
export type IntegrationReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked"
```

Checks:

```txt
Connection exists
Credentials valid
Webhook healthy
Required permissions exist
No critical failures
```

Example:

```txt
Shopify

Verdict:
  Warning

Issues:
  Webhook failing
```

## Health Monitoring

Show:

```txt
Last successful sync
Last failure
Failure count
Webhook failures
Connection health
```

Purpose:

```txt
Can this integration be trusted right now?
```

## Sensitive Execution Rule

Important governance rule:

```txt
Integration requests
must not bypass
Execution Kernel evaluation.
```

Example:

```txt
Shopify requests inventory adjustment.

Execution Kernel:
  checks permissions
  checks policies
  writes audit evidence

Only then:
  operation executes
```

## Audit Visibility

Show:

```txt
Credential updates
Webhook changes
Connection changes
Enable/disable events
Failures
```

Audit actions:

```txt
system_admin.integration.enable
system_admin.integration.disable
system_admin.integration.credentials.update
system_admin.integration.webhook.update
```

## Server Data Loader

```ts
export async function listSystemAdminIntegrations() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.integrations.read",
  )

  return listOrganizationIntegrations({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updateIntegrationSettings(
  input: UpdateIntegrationInput,
) {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.integrations.manage",
  )

  const parsed =
    updateIntegrationInputSchema.parse(
      input,
    )

  const result =
    await updateIntegrationSettingsInDb({
      organizationId: context.organizationId,
      actorId: context.userId,
      input: parsed,
    })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,

    action:
      "system_admin.integration.update",

    targetType: "integration",

    targetId: parsed.integrationId,
  })

  return result
}
```

## Zod Schemas

```ts
export const updateIntegrationInputSchema =
  z.object({
    integrationId: z.string().min(1),

    enabled: z.boolean(),
  })
```

Additional schemas:

```ts
export const updateWebhookInputSchema =
  z.object({
    integrationId: z.string().min(1),

    endpoint: z.string().url(),
  })
```

## Safety Rules

Integrations must enforce:

1. Integration changes are organization-scoped.
2. Credential values are never exposed.
3. Credential changes are audited.
4. Webhook changes are audited.
5. Enable/disable actions are audited.
6. Readiness verdicts are visible.
7. Failed integrations are clearly flagged.
8. Integration execution never bypasses Execution Kernel.
9. Secrets are masked everywhere.
10. Sensitive integration changes require confirmation.
11. Connection failures are visible.
12. Integration trust boundaries remain explicit.

## Definition of Done

Integrations is done when:

* administrators can view integrations
* administrators can enable integrations
* administrators can disable integrations
* administrators can inspect connection status
* administrators can inspect webhook status
* administrators can review credential visibility policy
* integration readiness verdicts are visible
* secrets remain masked
* connection failures are visible
* integration changes are audited
* Execution Kernel remains execution authority

## Minimum Tests

```txt
non-admin cannot view integrations
non-admin cannot update integrations
integration update writes audit event
credential values never exposed
webhook update audited
integration disable audited
connection status visible
readiness report generated
failed integration flagged
integration execution still requires Execution Kernel evaluation
```

## Final Architecture Statement

Integrations answer:

```txt
Which external systems are trusted and connected?
```

Security answers:

```txt
How are those connections protected?
```

Execution Kernel answers:

```txt
Can the requested action execute safely?
```

Audit Viewer answers:

```txt
Can the integration activity be proven later?
```

Integrations becomes Afenda's external trust-boundary governance surface, not merely an API configuration page.
