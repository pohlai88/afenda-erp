export class HrBonusSensitiveAccessError extends Error {
  constructor() {
    super("hr_bonus_sensitive_access_denied");
    this.name = "HrBonusSensitiveAccessError";
  }
}

export class HrBonusFinanceAccessError extends Error {
  constructor() {
    super("hr_bonus_finance_access_denied");
    this.name = "HrBonusFinanceAccessError";
  }
}
