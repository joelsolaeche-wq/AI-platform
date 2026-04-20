import { randomUUID } from 'crypto';
import { Enrollment } from '../../domain/entities/Enrollment';
import { Progress } from '../../domain/value-objects/Progress';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import {
  AlreadyEnrolledError,
  CourseNotPublishedError,
  EntityNotFoundError,
} from '../../domain/errors/DomainErrors';
import { IEmailPort } from '../ports/IEmailPort';
import { IQueuePort } from '../ports/IQueuePort';
import { EnrollmentDto, toEnrollmentDto } from '../dtos/EnrollmentDto';

export interface EnrollInCourseDto {
  userId: string;
  courseId: string;
}

/**
 * Use case: enroll an authenticated user in a published course.
 * Side effects (welcome email, search reindex) are dispatched via the queue port.
 */
export class EnrollInCourseUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly email: IEmailPort,
    private readonly queue: IQueuePort,
  ) {}

  async execute(dto: EnrollInCourseDto): Promise<EnrollmentDto> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new EntityNotFoundError('User', dto.userId);

    const course = await this.courseRepo.findById(dto.courseId);
    if (!course) throw new EntityNotFoundError('Course', dto.courseId);
    if (!course.published) throw new CourseNotPublishedError(dto.courseId);

    const existing = await this.enrollmentRepo.findByUserAndCourse(user.id, course.id);
    if (existing) throw new AlreadyEnrolledError(user.id, course.id);

    const enrollment = new Enrollment({
      id: randomUUID(),
      userId: user.id,
      courseId: course.id,
      progress: Progress.zero(),
      enrolledAt: new Date(),
    });

    await this.enrollmentRepo.save(enrollment);

    // Fire-and-forget side effects via queue.
    await this.queue.enqueue('send-welcome-email', {
      userId: user.id,
      courseId: course.id,
    });

    return toEnrollmentDto(enrollment);
  }
}
