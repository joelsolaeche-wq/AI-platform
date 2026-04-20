import { Course } from '../entities/Course';
import { CourseSlug } from '../value-objects/CourseSlug';

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findBySlug(slug: CourseSlug): Promise<Course | null>;
  listPublished(limit: number, offset: number): Promise<Course[]>;
  save(course: Course): Promise<void>;
}
