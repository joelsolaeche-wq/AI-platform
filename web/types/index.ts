/**
 * Shared TypeScript types used across the web application.
 */

/** DTO returned by GET /api/courses */
export interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
}
