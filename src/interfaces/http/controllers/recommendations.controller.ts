import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/di/CompositionRoot';
import { RecommendCoursesUseCase } from '../../../application/use-cases/RecommendCoursesUseCase';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    @Inject(TOKENS.RecommendCourses)
    private readonly recommend: RecommendCoursesUseCase,
  ) {}

  @Get(':userId')
  async forUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const data = await this.recommend.execute({
      userId,
      limit: limit ? Number(limit) : undefined,
    });
    return { data };
  }
}
