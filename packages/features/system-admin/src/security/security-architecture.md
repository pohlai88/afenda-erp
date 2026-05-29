### 9.10 Security

## Definition

Security manages the organization's security posture.

It defines the governance rules that determine how authentication, sessions, administrative actions, trusted access, and sensitive operations should be protected.

Security does not implement authentication.

Security does not implement session management.

Security configures the rules that the platform/auth layer and Execution Kernel enforce.

## Owns

Security owns:

* session policy settings
* MFA requirement settings
* trusted domains
* admin lockout protection
* sensitive action confirmation settings
* security posture review
* administrative access protection
* invite restrictions
* security exception review
* security readiness review
* security governance auditability

## Does Not Own

Security does not own:

* login implementation
* password storage
* MFA implementation
* session implementation
* identity provider integration
* permission enforcement
* role assignment
* user lifecycle management

Those belong to:

```txt
Platform/Auth Layer
Execution Kernel
Users
Memberships
Roles
Permissions
```

## Example Permission

```txt
system_admin.security.manage
```

Recommended split:

```txt
system_admin.security.read
system_admin.security.manage
system_admin.security.review
```

Phase 4 minimum:

```txt
system_admin.security.read
system_admin.security.manage
```

## Core Principle

Security answers:

```txt
What security rules govern this organization?
```

Not:

```txt
How does login work internally?
```

## Security Settings Model

```ts
export type OrganizationSecuritySettings = {
  organizationId: string

  requireMfaForAdmins: boolean

  allowedEmailDomains: string[]

  sessionMaxAgeMinutes: number

  idleTimeoutMinutes: number

  requireSensitiveActionConfirmation: boolean

  restrictInvitesToAllowedDomains: boolean

  adminLockoutProtectionEnabled: boolean

  updatedByUserId: string
  updatedAt: Date
}
```

## Security Categories

### Authentication Governance

Controls:

```txt
Admin MFA requirement
Organization MFA requirement
Trusted authentication policies
```

Platform/Auth implements enforcement.

Security configures requirements.

---

### Session Governance

Controls:

```txt
Session maximum lifetime
Idle timeout
Administrative session restrictions
```

Example:

```txt
Session expires after 8 hours

Idle timeout after 30 minutes
```

---

### Domain Governance

Controls:

```txt
Trusted email domains
Invite restrictions
Allowed organization domains
```

Example:

```txt
@company.com
@subsidiary.com
```

Invites outside trusted domains may be blocked or require approval.

---

### Sensitive Action Governance

Controls:

```txt
Security confirmation required
Administrative confirmation required
Re-authentication required
```

Examples:

```txt
Disable module
Remove owner
Change payroll configuration
Update security settings
```

---

### Administrative Protection

Controls:

```txt
Owner protection
Admin lockout protection
Critical role protection
```

Examples:

```txt
Cannot remove last active owner

Cannot suspend final administrator

Cannot disable all administrative access
```

## Security Page

Route:

```txt
/apps/system-admin/security
```

Purpose:

```txt
Review and configure organizational security posture.
```

Recommended sections:

```txt
Authentication Governance
Session Governance
Domain Governance
Administrative Protection
Sensitive Action Protection
Security Readiness
```

## Security Readiness

This should be one of the most important admin surfaces.

```ts
export type SecurityReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked"
```

Checks:

```txt
MFA enabled
Trusted domains configured
Admin lockout protection enabled
Critical roles exist
Owner exists
Security confirmations enabled
```

Example:

```txt
Security Posture

Verdict:
  Warning

Issues:
  MFA not required for admins
  No trusted domains configured
```

## Trusted Domains

Purpose:

```txt
Control organizational identity boundaries.
```

Example:

```txt
Allowed Domains

company.com
subsidiary.com
```

Policy:

```txt
Invites outside trusted domains require approval.
```

## Sensitive Action Confirmation

Examples:

```txt
Disable module
Delete policy
Remove owner
Change security settings
```

Execution Kernel can require:

```txt
Secondary confirmation
Password re-entry
MFA challenge
```

Security defines the requirement.

Platform/Auth performs the challenge.

## Administrative Lockout Protection

Purpose:

```txt
Prevent accidental loss of administrative control.
```

Examples:

```txt
Cannot remove final owner

Cannot suspend final owner

Cannot remove final administrator

Cannot disable all admin-capable roles
```

This protection should never be casually disabled.

## Security Investigation View

Should show:

```txt
Current posture
Recent security changes
Recent admin actions
Readiness verdict
Outstanding risks
```

This becomes the security truth page.

## Server Data Loader

```ts
export async function getSystemAdminSecuritySettings() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.security.read",
  )

  return getOrganizationSecuritySettings({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updateSecuritySettings(
  input: UpdateSecuritySettingsInput,
) {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.security.manage",
  )

  const parsed =
    updateSecuritySettingsInputSchema.parse(
      input,
    )

  const result =
    await updateOrganizationSecuritySettings({
      organizationId: context.organizationId,
      actorId: context.userId,
      input: parsed,
    })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,

    action:
      "system_admin.security.update",

    targetType:
      "organization_security_settings",

    targetId: context.organizationId,
  })

  return result
}
```

## Zod Schemas

```ts
export const updateSecuritySettingsInputSchema =
  z.object({
    requireMfaForAdmins:
      z.boolean(),

    allowedEmailDomains:
      z.array(z.string()).max(25),

    sessionMaxAgeMinutes:
      z.number()
        .int()
        .min(15)
        .max(43200),

    idleTimeoutMinutes:
      z.number()
        .int()
        .min(5)
        .max(1440),

    requireSensitiveActionConfirmation:
      z.boolean(),

    restrictInvitesToAllowedDomains:
      z.boolean(),

    adminLockoutProtectionEnabled:
      z.boolean(),
  })
```

## Safety Rules

Security must enforce:

1. Security settings are organization-scoped.
2. Security changes are audited.
3. MFA requirement changes are audited.
4. Domain changes are audited.
5. Session policy changes are audited.
6. Admin lockout protection cannot be casually disabled.
7. Dangerous security changes require confirmation.
8. Security readiness verdict must be visible.
9. Platform/Auth remains implementation authority.
10. Execution Kernel remains authorization authority.
11. Security Viewer cannot directly modify authentication internals.
12. Sensitive security actions may require re-authentication.

## Definition of Done

Security is done when:

* administrators can view security posture
* administrators can configure MFA requirements
* administrators can configure session governance
* administrators can configure trusted domains
* administrators can configure invite restrictions
* administrators can configure sensitive action protection
* administrators can review security readiness
* dangerous security changes require confirmation
* security changes are audited
* organization scope is enforced
* admin lockout protection exists

## Minimum Tests

```txt
non-admin cannot view security settings
non-admin cannot update security settings
security update writes audit event
invalid domain rejected
MFA requirement update audited
session policy update audited
admin lockout protection enforced
dangerous changes require confirmation
security readiness report generated
organization isolation enforced
```

## Final Architecture Statement

Platform/Auth answers:

```txt
How does authentication work?
```

Execution Kernel answers:

```txt
Can this actor perform the action?
```

Security answers:

```txt
What organizational security rules must be enforced?
```

Audit Viewer answers:

```txt
Can those security decisions be proven later?
```

Security is Afenda's security governance surface, not an authentication implementation surface.
