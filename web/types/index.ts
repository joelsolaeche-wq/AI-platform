/**
 * Shared TypeScript types used across the web application.
 */

/**
 * User roles supported by the platform.
 * Mirrors the role concept used server-side; kept as a plain string union so
 * it can be serialised into JWTs and session objects without any runtime overhead.
 */
export type Role = 'student' | 'instructor' | 'admin';

/** DTO returned by GET /api/courses */
export interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
}
