import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { ICachePort } from '../ports/ICachePort';
import { CourseDto, toCourseDto } from '../dtos/CourseDto';

export interface ListPublishedCoursesDto {
  limit?: number;
  offset?: number;
}

export class ListPublishedCoursesUseCase {
  private static readonly CACHE_TTL = 60; // seconds

  constructor(
    private readonly courseRepo: ICourseRepository,
    private readonly cache: ICachePort,
  ) {}

  async execute(dto: ListPublishedCoursesDto): Promise<CourseDto[]> {
    const limit = Math.min(Math.max(dto.limit ?? 20, 1), 100);
    const offset = Math.max(dto.offset ?? 0, 0);

    const cacheKey = `courses:published:${limit}:${offset}`;
    const cached = await this.cache.get<CourseDto[]>(cacheKey);
    if (cached) return cached;

    const courses = await this.courseRepo.listPublished(limit, offset);
    const dtos = courses.map(toCourseDto);

    await this.cache.set(cacheKey, dtos, ListPublishedCoursesUseCase.CACHE_TTL);
    return dtos;
  }
}
