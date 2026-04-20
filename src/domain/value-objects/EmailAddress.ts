/**
 * EmailAddress — immutable value object.
 * Equality by value. Validates format inside the constructor.
 */
export class EmailAddress {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!EmailAddress.PATTERN.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  equals(other: EmailAddress): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

export class InvalidEmailError extends Error {
  constructor(value: string) {
    super(`Invalid email address: "${value}"`);
    this.name = 'InvalidEmailError';
  }
}
