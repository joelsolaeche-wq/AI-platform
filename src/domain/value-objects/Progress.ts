/**
 * Progress — a value between 0 and 1 representing course completion.
 */
export class Progress {
  private readonly _value: number;

  constructor(value: number) {
    if (Number.isNaN(value) || value < 0 || value > 1) {
      throw new InvalidProgressError(value);
    }
    this._value = value;
  }

  static zero(): Progress {
    return new Progress(0);
  }

  static complete(): Progress {
    return new Progress(1);
  }

  get value(): number {
    return this._value;
  }

  get percentage(): number {
    return Math.round(this._value * 100);
  }

  isComplete(): boolean {
    return this._value >= 1;
  }

  advance(delta: number): Progress {
    return new Progress(Math.min(1, this._value + delta));
  }

  equals(other: Progress): boolean {
    return this._value === other._value;
  }
}

export class InvalidProgressError extends Error {
  constructor(value: number) {
    super(`Progress must be between 0 and 1, got ${value}`);
    this.name = 'InvalidProgressError';
  }
}
