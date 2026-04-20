import { Controller, Get, Inject, Query } from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/di/CompositionRoot';
import { ListPublishedCoursesUseCase } from '../../../application/use-cases/ListPublishedCoursesUseCase';
import { ListCoursesQueryDto } from '../dto/list-courses.dto';

@Controller('courses')
export class CoursesController {
  constructor(
    @Inject(TOKENS.ListCourses)
    private readonly listCourses: ListPublishedCoursesUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListCoursesQueryDto) {
    const courses = await this.listCourses.execute({
      limit: query.limit,
      offset: query.offset,
    });
    return { data: courses };
  }
}
