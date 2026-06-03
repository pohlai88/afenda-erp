export class HrDocumentsSensitiveAccessError extends Error {
  constructor(message = "hr_documents_sensitive_access_denied") {
    super(message);
    this.name = "HrDocumentsSensitiveAccessError";
  }
}
