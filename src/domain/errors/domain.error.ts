/**
 * Base class for all domain-level business rule errors.
 * 100% pure TypeScript, zero framework dependencies.
 */
export abstract class DomainError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidUuidError extends DomainError {
  public readonly code = 'INVALID_UUID';

  constructor(entityName: string, invalidValue: string) {
    super(`Invalid ${entityName} identifier: "${invalidValue}". Expected valid UUID v4 format.`);
  }
}

export class EntityNotFoundError extends DomainError {
  public readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" was not found.`);
  }
}

export class InvalidUrlError extends DomainError {
  public readonly code = 'INVALID_URL';

  constructor(invalidUrl: string, reason?: string) {
    super(`Invalid target URL: "${invalidUrl}"${reason ? `. Reason: ${reason}` : ''}`);
  }
}

export class InvalidSeverityError extends DomainError {
  public readonly code = 'INVALID_SEVERITY';

  constructor(invalidSeverity: string) {
    super(`Invalid severity level: "${invalidSeverity}". Expected critical, serious, moderate, or minor.`);
  }
}

export class InvalidPatternTypeError extends DomainError {
  public readonly code = 'INVALID_PATTERN_TYPE';

  constructor(invalidPatternType: string) {
    super(`Invalid accessibility pattern type: "${invalidPatternType}".`);
  }
}

export class InvalidStateTransitionError extends DomainError {
  public readonly code = 'INVALID_STATE_TRANSITION';

  constructor(entityName: string, fromState: string, toState: string) {
    super(`Cannot transition ${entityName} from state "${fromState}" to "${toState}".`);
  }
}

export class ApprovalRequiredError extends DomainError {
  public readonly code = 'APPROVAL_REQUIRED';

  constructor(remediationId: string) {
    super(`Remediation "${remediationId}" must be approved before application.`);
  }
}

export class PatternNotSupportedError extends DomainError {
  public readonly code = 'PATTERN_NOT_SUPPORTED';

  constructor(patternType: string) {
    super(`Accessibility pattern "${patternType}" is not registered or supported.`);
  }
}

export class PatternAlreadyRegisteredError extends DomainError {
  public readonly code = 'PATTERN_ALREADY_REGISTERED';

  constructor(patternType: string) {
    super(`Accessibility pattern "${patternType}" is already registered.`);
  }
}

