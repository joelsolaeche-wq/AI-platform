import { ILessonRepository } from '../../domain/repositories/ILessonRepository';
import { EntityNotFoundError } from '../../domain/errors/DomainErrors';
import { IEmbeddingPort } from '../ports/IEmbeddingPort';
import { IVectorSearchPort } from '../ports/IVectorSearchPort';

export interface GenerateLessonEmbeddingDto {
  lessonId: string;
}

/**
 * Background use case: compute an embedding for a lesson and upsert it
 * into the pgvector index. Triggered from a BullMQ worker.
 */
export class GenerateLessonEmbeddingUseCase {
  constructor(
    private readonly lessonRepo: ILessonRepository,
    private readonly embeddings: IEmbeddingPort,
    private readonly vectorSearch: IVectorSearchPort,
  ) {}

  async execute(dto: GenerateLessonEmbeddingDto): Promise<void> {
    const lesson = await this.lessonRepo.findById(dto.lessonId);
    if (!lesson) throw new EntityNotFoundError('Lesson', dto.lessonId);

    const text = `${lesson.title}\n\n${lesson.content}`;
    const vec = await this.embeddings.embed(text);
    await this.vectorSearch.upsertLessonEmbedding(lesson.id, vec);
  }
}
