import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/di/CompositionRoot';
import { EnrollInCourseUseCase } from '../../../application/use-cases/EnrollInCourseUseCase';
import {
  AlreadyEnrolledError,
  CourseNotPublishedError,
  EntityNotFoundError,
} from '../../../domain/errors/DomainErrors';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    @Inject(TOKENS.EnrollInCourse)
    private readonly enroll: EnrollInCourseUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateEnrollmentDto) {
    try {
      const result = await this.enroll.execute({
        userId: body.userId,
        courseId: body.courseId,
      });
      return { data: result };
    } catch (err) {
      if (err instanceof EntityNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof CourseNotPublishedError) throw new BadRequestException(err.message);
      if (err instanceof AlreadyEnrolledError) throw new ConflictException(err.message);
      throw err;
    }
  }
}
