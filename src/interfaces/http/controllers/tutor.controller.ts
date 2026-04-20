import { Body, Controller, Inject, Post } from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/di/CompositionRoot';
import { AskTutorUseCase } from '../../../application/use-cases/AskTutorUseCase';
import { AskTutorDto } from '../dto/ask-tutor.dto';

@Controller('tutor')
export class TutorController {
  constructor(
    @Inject(TOKENS.AskTutor)
    private readonly askTutor: AskTutorUseCase,
  ) {}

  @Post('ask')
  async ask(@Body() body: AskTutorDto) {
    const result = await this.askTutor.execute({
      userId: body.userId,
      courseId: body.courseId,
      question: body.question,
      history: body.history,
    });
    return { data: result };
  }
}
