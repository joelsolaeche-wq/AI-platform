import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';
import { RecommendationDomainService } from '../../domain/services/RecommendationDomainService';
import { CourseDto, toCourseDto } from '../dtos/CourseDto';

export interface RecommendCoursesDto {
  userId: string;
  limit?: number;
}

export class RecommendCoursesUseCase {
  constructor(
    private readonly courseRepo: ICourseRepository,
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly recommender: RecommendationDomainService,
  ) {}

  async execute(dto: RecommendCoursesDto): Promise<CourseDto[]> {
    const limit = Math.min(Math.max(dto.limit ?? 10, 1), 50);
    const enrollments = await this.enrollmentRepo.findByUserId(dto.userId);

    if (!this.recommender.readyForMore(enrollments)) {
      return [];
    }

    const candidates = await this.courseRepo.listPublished(limit * 3, 0);
    const ranked = this.recommender.rank(candidates, enrollments).slice(0, limit);
    return ranked.map(toCourseDto);
  }
}
