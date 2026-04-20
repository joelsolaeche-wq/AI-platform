import { ILessonRepository } from '../../domain/repositories/ILessonRepository';
import { IAiTutorPort, TutorMessage } from '../ports/IAiTutorPort';
import { IEmbeddingPort } from '../ports/IEmbeddingPort';
import { IVectorSearchPort } from '../ports/IVectorSearchPort';
import { IRealtimePort } from '../ports/IRealtimePort';
import { AskTutorInputDto, AskTutorOutputDto } from '../dtos/TutorDto';

/**
 * Use case: a learner asks a question about a course.
 * RAG pipeline:
 *   1. Embed the question (Voyage).
 *   2. Retrieve top-K relevant lessons via pgvector.
 *   3. Build grounded context and call Claude.
 *   4. Broadcast the answer via Pusher so other devices update live.
 */
export class AskTutorUseCase {
  private static readonly TOP_K = 5;

  constructor(
    private readonly lessonRepo: ILessonRepository,
    private readonly embeddings: IEmbeddingPort,
    private readonly vectorSearch: IVectorSearchPort,
    private readonly tutor: IAiTutorPort,
    private readonly realtime: IRealtimePort,
  ) {}

  async execute(dto: AskTutorInputDto): Promise<AskTutorOutputDto> {
    if (!dto.question || dto.question.trim().length < 3) {
      throw new Error('Question must be at least 3 characters');
    }

    const qVec = await this.embeddings.embed(dto.question);
    const hits = await this.vectorSearch.searchLessons(qVec, AskTutorUseCase.TOP_K);

    const context: string[] = [];
    for (const hit of hits) {
      const lesson = await this.lessonRepo.findById(hit.lessonId);
      if (lesson && lesson.courseId === dto.courseId) {
        context.push(`# ${lesson.title}\n${lesson.content}`);
      }
    }

    const history: TutorMessage[] = dto.history ?? [];
    const result = await this.tutor.answer({
      question: dto.question,
      context,
      history,
    });

    await this.realtime.publish(`user-${dto.userId}`, 'tutor.answer', {
      courseId: dto.courseId,
      answer: result.answer,
      citedLessonIds: result.citedLessonIds,
    });

    return { answer: result.answer, citedLessonIds: result.citedLessonIds };
  }
}
