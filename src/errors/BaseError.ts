/**
 * @since 1.0.0
 */
class BaseError extends Error {
  public override readonly name: string;
  public readonly statusCode: number;
  public readonly description: string;
  public readonly isTrustedError: boolean;

  constructor(name: string, description: string, statusCode: number) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.description = description;
    this.isTrustedError = true;
    Error.captureStackTrace(this);
  }
}

export { BaseError };
