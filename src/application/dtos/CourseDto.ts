import { Course } from '../../domain/entities/Course';

export interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
}

export function toCourseDto(course: Course): CourseDto {
  return {
    id: course.id,
    slug: course.slug.value,
    title: course.title,
    description: course.description,
    published: course.published,
    createdAt: course.createdAt.toISOString(),
  };
}
