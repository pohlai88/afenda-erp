export class HrBenefitsSensitiveAccessError extends Error {
  constructor(message = "Sensitive benefits access required.") {
    super(message);
    this.name = "HrBenefitsSensitiveAccessError";
  }
}
