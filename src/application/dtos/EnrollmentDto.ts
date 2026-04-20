import { Enrollment } from '../../domain/entities/Enrollment';

export interface EnrollmentDto {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  progressPercentage: number;
  isComplete: boolean;
  enrolledAt: string;
}

export function toEnrollmentDto(enrollment: Enrollment): EnrollmentDto {
  return {
    id: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    progress: enrollment.progress.value,
    progressPercentage: enrollment.progress.percentage,
    isComplete: enrollment.isComplete(),
    enrolledAt: enrollment.enrolledAt.toISOString(),
  };
}
