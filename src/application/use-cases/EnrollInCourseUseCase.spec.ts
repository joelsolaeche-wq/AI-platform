import { EnrollInCourseUseCase } from './EnrollInCourseUseCase';
import { User } from '../../domain/entities/User';
import { Course } from '../../domain/entities/Course';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { CourseSlug } from '../../domain/value-objects/CourseSlug';
import {
  AlreadyEnrolledError,
  CourseNotPublishedError,
  EntityNotFoundError,
} from '../../domain/errors/DomainErrors';

describe('EnrollInCourseUseCase', () => {
  const makeUser = () =>
    new User({
      id: 'u1',
      email: new EmailAddress('learner@example.com'),
      name: 'Learner',
      workosId: null,
      createdAt: new Date(),
    });

  const makeCourse = (published = true) =>
    new Course({
      id: 'c1',
      slug: new CourseSlug('intro-to-ai'),
      title: 'Intro to AI',
      description: 'A gentle introduction to AI systems.',
      published,
      createdAt: new Date(),
    });

  const buildUseCase = (overrides: {
    user?: User | null;
    course?: Course | null;
    existingEnrollment?: unknown;
  }) => {
    const saved: unknown[] = [];
    const enqueued: { name: string; payload: unknown }[] = [];

    const useCase = new EnrollInCourseUseCase(
      { findById: async () => overrides.user ?? null } as never,
      { findById: async () => overrides.course ?? null } as never,
      {
        findByUserAndCourse: async () => overrides.existingEnrollment ?? null,
        save: async (e: unknown) => {
          saved.push(e);
        },
      } as never,
      { send: async () => undefined },
      {
        enqueue: async (name: string, payload: unknown) => {
          enqueued.push({ name, payload });
        },
      } as never,
    );
    return { useCase, saved, enqueued };
  };

  it('creates an enrollment for a valid request', async () => {
    const { useCase, saved, enqueued } = buildUseCase({
      user: makeUser(),
      course: makeCourse(true),
    });

    const result = await useCase.execute({ userId: 'u1', courseId: 'c1' });

    expect(result.userId).toBe('u1');
    expect(result.courseId).toBe('c1');
    expect(result.progress).toBe(0);
    expect(saved).toHaveLength(1);
    expect(enqueued[0].name).toBe('send-welcome-email');
  });

  it('throws when user is missing', async () => {
    const { useCase } = buildUseCase({ user: null, course: makeCourse() });
    await expect(useCase.execute({ userId: 'x', courseId: 'c1' })).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });

  it('throws when course is not published', async () => {
    const { useCase } = buildUseCase({ user: makeUser(), course: makeCourse(false) });
    await expect(useCase.execute({ userId: 'u1', courseId: 'c1' })).rejects.toBeInstanceOf(
      CourseNotPublishedError,
    );
  });

  it('throws when learner is already enrolled', async () => {
    const { useCase } = buildUseCase({
      user: makeUser(),
      course: makeCourse(),
      existingEnrollment: { id: 'e1' },
    });
    await expect(useCase.execute({ userId: 'u1', courseId: 'c1' })).rejects.toBeInstanceOf(
      AlreadyEnrolledError,
    );
  });
});
