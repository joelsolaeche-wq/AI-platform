import { PrismaClient, Prisma } from '@prisma/client';
import { IVectorSearchPort, VectorSearchHit } from '../../application/ports/IVectorSearchPort';

/**
 * pgvector-backed implementation of IVectorSearchPort.
 * Uses raw SQL because Prisma does not natively support the `vector` type.
 */
export class PgVectorSearchAdapter implements IVectorSearchPort {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertLessonEmbedding(lessonId: string, embedding: number[]): Promise<void> {
    const vec = `[${embedding.join(',')}]`;
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "LessonEmbedding" ("id", "lessonId", "embedding", "createdAt")
        VALUES (gen_random_uuid(), ${lessonId}, ${vec}::vector, NOW())
        ON CONFLICT ("lessonId") DO UPDATE SET "embedding" = EXCLUDED."embedding"
      `,
    );
  }

  async searchLessons(embedding: number[], limit: number): Promise<VectorSearchHit[]> {
    const vec = `[${embedding.join(',')}]`;
    const rows = await this.prisma.$queryRaw<Array<{ lessonId: string; score: number }>>(
      Prisma.sql`
        SELECT "lessonId", 1 - ("embedding" <=> ${vec}::vector) AS "score"
        FROM "LessonEmbedding"
        ORDER BY "embedding" <=> ${vec}::vector
        LIMIT ${limit}
      `,
    );
    return rows.map((r) => ({ lessonId: r.lessonId, score: Number(r.score) }));
  }
}
