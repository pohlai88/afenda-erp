### 9.11 Organization Settings

## Definition

Organization Settings defines the operating defaults for an organization.

It acts as the organizational configuration contract that ERP modules consume when executing business processes.

Organization Settings is not merely company profile information.

It provides the foundational settings that influence:

* localization
* calendars
* numbering
* document generation
* fiscal operations
* operational defaults
* organizational identity

## Owns

Organization Settings owns:

* organization profile
* locale defaults
* time zone defaults
* operating calendar settings
* numbering settings
* document prefix settings
* fiscal calendar settings
* working day configuration
* regional configuration
* organization metadata
* organization operating defaults

## Does Not Own

Organization Settings does not own:

* user management
* role assignment
* permission enforcement
* policy enforcement
* authentication
* module enablement
* workflow execution

Those belong to:

```txt
Users
Memberships
Roles
Permissions
Policies
Security
Execution Kernel
Modules
```

## Example Permission

```txt
system_admin.organization.manage
```

Recommended split:

```txt
system_admin.organization.read
system_admin.organization.manage
system_admin.organization.review
```

Phase 4 minimum:

```txt
system_admin.organization.read
system_admin.organization.manage
```

## Core Principle

Organization Settings answers:

```txt
How does this organization operate by default?
```

Not:

```txt
What users exist?
```

Not:

```txt
What permissions exist?
```

## Organization Profile

Basic identity:

```ts
export type OrganizationProfile = {
  organizationId: string

  legalName: string

  displayName: string

  registrationNumber?: string

  taxNumber?: string

  website?: string

  email?: string

  phone?: string

  address?: string

  countryCode: string
}
```

Purpose:

```txt
Provide official organization identity.
```

## Locale Defaults

Controls:

```txt
Default language
Default locale
Date formatting
Number formatting
Currency formatting
```

Example:

```txt
Locale:
  en-MY

Currency:
  MYR

Date:
  DD/MM/YYYY
```

Used by:

```txt
AppShell
Reports
Documents
Exports
Invoices
Payroll
```

## Time Zone Defaults

Controls:

```txt
Organization timezone
Default scheduling timezone
Report timezone
Audit display timezone
```

Example:

```txt
Asia/Kuala_Lumpur
```

Used by:

```txt
Orbit
Approvals
Audit Viewer
Reports
Scheduling
```

## Operating Calendar

Purpose:

```txt
Define business working days.
```

Example:

```txt
Monday-Friday

Public holidays:
  Malaysia
```

Potential model:

```ts
export type OrganizationCalendarSettings = {
  workingDays: number[]

  holidayCalendarKey?: string
}
```

Used by:

```txt
HRM
Orbit
Approvals
Scheduling
SLA calculations
```

## Fiscal Calendar

Purpose:

```txt
Define accounting periods.
```

Example:

```txt
Fiscal Year Start:
  January

Fiscal Year End:
  December
```

Used by:

```txt
Accounting
Budgeting
Forecasting
Reporting
```

## Numbering Settings

Purpose:

```txt
Define ERP document numbering.
```

Example:

```txt
Employee
EMP-000001

Invoice
INV-2026-000001

Purchase Order
PO-2026-000001
```

Potential model:

```ts
export type NumberingRule = {
  key: string

  prefix: string

  nextNumber: number

  padding: number
}
```

## Document Prefix Settings

Examples:

```txt
INV
PO
SO
EMP
PAY
VND
CUS
```

Purpose:

```txt
Ensure organizational consistency.
```

## Organization Settings Page

Route:

```txt
/apps/system-admin/organization
```

Purpose:

```txt
Review and configure organizational operating defaults.
```

Recommended sections:

```txt
Organization Profile
Localization
Time Zone
Operating Calendar
Fiscal Calendar
Numbering
Document Prefixes
Readiness
```

## Readiness Review

Organization Settings should expose readiness.

```ts
export type OrganizationSettingsReadiness =
  | "ready"
  | "warning"
  | "blocked"
```

Checks:

```txt
Locale configured
Timezone configured
Calendar configured
Fiscal year configured
Numbering configured
Required prefixes configured
```

Example:

```txt
Organization Settings

Verdict:
  Warning

Issues:
  Fiscal calendar missing
  Invoice numbering not configured
```

## Module Consumption

Examples:

```txt
Accounting
  Fiscal Calendar
  Invoice Numbering

HRM
  Employee Numbering
  Working Calendar

Orbit
  Timezone
  Working Days

Sales
  Quotation Numbering

Inventory
  Stock Document Numbering
```

Organization Settings is a shared operating contract.

## Server Data Loader

```ts
export async function getOrganizationSettings() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.organization.read",
  )

  return getOrganizationSettingsById({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updateOrganizationSettings(
  input: UpdateOrganizationSettingsInput,
) {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.organization.manage",
  )

  const parsed =
    updateOrganizationSettingsInputSchema.parse(
      input,
    )

  const result =
    await updateOrganizationSettingsInDb({
      organizationId: context.organizationId,
      actorId: context.userId,
      input: parsed,
    })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,

    action:
      "system_admin.organization.update",

    targetType:
      "organization_settings",

    targetId: context.organizationId,
  })

  return result
}
```

## Safety Rules

Organization Settings must enforce:

1. Organization scope is mandatory.
2. Organization changes are audited.
3. Fiscal calendar changes are audited.
4. Numbering changes are audited.
5. Locale changes are audited.
6. Invalid time zones are rejected.
7. Invalid numbering formats are rejected.
8. Required settings cannot be left empty.
9. Readiness verdict must be visible.
10. Settings changes must not silently break dependent modules.

## Definition of Done

Organization Settings is done when:

* administrators can view organization profile
* administrators can configure locale defaults
* administrators can configure timezone defaults
* administrators can configure operating calendar
* administrators can configure fiscal calendar
* administrators can configure numbering settings
* administrators can configure document prefixes
* readiness verdict is visible
* organization changes are audited
* dependent modules can consume settings

## Minimum Tests

```txt
non-admin cannot view organization settings
non-admin cannot update organization settings
organization update writes audit event
invalid timezone rejected
invalid numbering format rejected
fiscal calendar update audited
document prefix update audited
organization readiness report generated
organization scope enforced
dependent modules receive updated settings
```

## Final Architecture Statement

Organization Settings answers:

```txt
How does this organization operate by default?
```

Security answers:

```txt
How must the organization be protected?
```

Modules answer:

```txt
What ERP domains are available?
```

Execution Kernel answers:

```txt
How are these defaults applied during execution?
```

Organization Settings becomes the operating contract that all ERP modules consume.
