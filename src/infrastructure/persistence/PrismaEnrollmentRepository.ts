import { PrismaClient } from '@prisma/client';
import { Enrollment } from '../../domain/entities/Enrollment';
import { Progress } from '../../domain/value-objects/Progress';
import { IEnrollmentRepository } from '../../domain/repositories/IEnrollmentRepository';

export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Enrollment | null> {
    const row = await this.prisma.enrollment.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    const row = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    const rows = await this.prisma.enrollment.findMany({ where: { userId } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(enrollment: Enrollment): Promise<void> {
    await this.prisma.enrollment.upsert({
      where: { id: enrollment.id },
      create: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        progress: enrollment.progress.value,
        enrolledAt: enrollment.enrolledAt,
      },
      update: {
        progress: enrollment.progress.value,
      },
    });
  }

  private toDomain(row: {
    id: string;
    userId: string;
    courseId: string;
    progress: number;
    enrolledAt: Date;
  }): Enrollment {
    return new Enrollment({
      id: row.id,
      userId: row.userId,
      courseId: row.courseId,
      progress: new Progress(row.progress),
      enrolledAt: row.enrolledAt,
    });
  }
}
