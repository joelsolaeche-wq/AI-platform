/**
 * CourseSlug — URL-safe identifier for a course.
 * Lowercase alphanumeric + hyphens; 3–80 chars.
 */
export class CourseSlug {
  private static readonly PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 80 || !CourseSlug.PATTERN.test(trimmed)) {
      throw new InvalidCourseSlugError(value);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  equals(other: CourseSlug): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

export class InvalidCourseSlugError extends Error {
  constructor(value: string) {
    super(`Invalid course slug: "${value}"`);
    this.name = 'InvalidCourseSlugError';
  }
}
