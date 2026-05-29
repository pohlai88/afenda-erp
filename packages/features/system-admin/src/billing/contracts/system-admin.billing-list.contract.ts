export type SystemAdminBillingContactRole =
  | "primary"
  | "invoice"
  | "procurement";

export type SystemAdminBillingContactRow = {
  id: string;
  role: SystemAdminBillingContactRole;
  roleLabel: string;
  name: string;
  email: string;
  source: "configured" | "derived";
};

export type SystemAdminBillingEntitlementRow = {
  id: string;
  key: string;
  label: string;
  status: string;
  source: string;
};

export type SystemAdminBillingInvoiceRow = {
  id: string;
  reference: string;
  period: string;
  amount: string;
  status: string;
};

export type SystemAdminBillingPaymentRow = {
  id: string;
  method: string;
  status: string;
  lastActivity: string;
};

export function formatBillingContactRoleLabel(
  role: SystemAdminBillingContactRole,
) {
  switch (role) {
    case "primary":
      return "Primary billing contact";
    case "invoice":
      return "Invoice contact";
    case "procurement":
      return "Procurement contact";
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}
