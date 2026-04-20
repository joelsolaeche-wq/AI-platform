import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';

/**
 * RecommendationDomainService
 *
 * Pure business logic that ranks candidate courses against a learner's history.
 * Does NOT call any AI service or database — those concerns live in infrastructure.
 * Infrastructure may use this service to post-process semantic-search candidates.
 */
export class RecommendationDomainService {
  /**
   * Filters and ranks candidates by:
   *   1. Excluding courses the learner is already enrolled in.
   *   2. Excluding unpublished courses.
   *   3. Preserving the input order of `candidates` (which upstream layers
   *      may have already sorted by relevance score).
   */
  rank(candidates: Course[], existingEnrollments: Enrollment[]): Course[] {
    const enrolledCourseIds = new Set(existingEnrollments.map((e) => e.courseId));
    return candidates.filter((c) => c.published && !enrolledCourseIds.has(c.id));
  }

  /**
   * Determines whether a learner is "ready" for more content
   * (i.e. has completed at least `threshold` fraction of current enrollments).
   */
  readyForMore(enrollments: Enrollment[], threshold = 0.5): boolean {
    if (enrollments.length === 0) return true;
    const avgProgress =
      enrollments.reduce((sum, e) => sum + e.progress.value, 0) / enrollments.length;
    return avgProgress >= threshold;
  }
}
