/** Base class for all domain-layer errors. */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, identifier: string) {
    super(`${entity} not found: ${identifier}`);
  }
}

export class AlreadyEnrolledError extends DomainError {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is already enrolled in course ${courseId}`);
  }
}

export class CourseNotPublishedError extends DomainError {
  constructor(courseId: string) {
    super(`Course ${courseId} is not published`);
  }
}
