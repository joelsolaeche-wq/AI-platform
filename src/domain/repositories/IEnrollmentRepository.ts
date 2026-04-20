import { Enrollment } from '../entities/Enrollment';

export interface IEnrollmentRepository {
  findById(id: string): Promise<Enrollment | null>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  findByUserId(userId: string): Promise<Enrollment[]>;
  save(enrollment: Enrollment): Promise<void>;
}
