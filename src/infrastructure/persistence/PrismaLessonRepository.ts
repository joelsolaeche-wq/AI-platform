import { PrismaClient } from '@prisma/client';
import { Lesson } from '../../domain/entities/Lesson';
import { ILessonRepository } from '../../domain/repositories/ILessonRepository';

export class PrismaLessonRepository implements ILessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Lesson | null> {
    const row = await this.prisma.lesson.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const rows = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(lesson: Lesson): Promise<void> {
    await this.prisma.lesson.upsert({
      where: { id: lesson.id },
      create: {
        id: lesson.id,
        courseId: lesson.courseId,
        title: lesson.title,
        content: lesson.content,
        orderIndex: lesson.orderIndex,
        muxAssetId: lesson.muxAssetId,
        muxPlaybackId: lesson.muxPlaybackId,
        durationSec: lesson.durationSec,
        createdAt: lesson.createdAt,
      },
      update: {
        title: lesson.title,
        content: lesson.content,
        orderIndex: lesson.orderIndex,
        muxAssetId: lesson.muxAssetId,
        muxPlaybackId: lesson.muxPlaybackId,
        durationSec: lesson.durationSec,
      },
    });
  }

  private toDomain(row: {
    id: string;
    courseId: string;
    title: string;
    content: string;
    orderIndex: number;
    muxAssetId: string | null;
    muxPlaybackId: string | null;
    durationSec: number | null;
    createdAt: Date;
  }): Lesson {
    return new Lesson({
      id: row.id,
      courseId: row.courseId,
      title: row.title,
      content: row.content,
      orderIndex: row.orderIndex,
      muxAssetId: row.muxAssetId,
      muxPlaybackId: row.muxPlaybackId,
      durationSec: row.durationSec,
      createdAt: row.createdAt,
    });
  }
}
