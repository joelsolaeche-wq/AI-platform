import { Lesson } from '../entities/Lesson';

export interface ILessonRepository {
  findById(id: string): Promise<Lesson | null>;
  findByCourseId(courseId: string): Promise<Lesson[]>;
  save(lesson: Lesson): Promise<void>;
}
