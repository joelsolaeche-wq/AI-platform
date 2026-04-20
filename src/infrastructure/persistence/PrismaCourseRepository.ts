import { PrismaClient } from '@prisma/client';
import { Course } from '../../domain/entities/Course';
import { CourseSlug } from '../../domain/value-objects/CourseSlug';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Course | null> {
    const row = await this.prisma.course.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: CourseSlug): Promise<Course | null> {
    const row = await this.prisma.course.findUnique({ where: { slug: slug.value } });
    return row ? this.toDomain(row) : null;
  }

  async listPublished(limit: number, offset: number): Promise<Course[]> {
    const rows = await this.prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(course: Course): Promise<void> {
    await this.prisma.course.upsert({
      where: { id: course.id },
      create: {
        id: course.id,
        slug: course.slug.value,
        title: course.title,
        description: course.description,
        published: course.published,
        createdAt: course.createdAt,
      },
      update: {
        title: course.title,
        description: course.description,
        published: course.published,
      },
    });
  }

  private toDomain(row: {
    id: string;
    slug: string;
    title: string;
    description: string;
    published: boolean;
    createdAt: Date;
  }): Course {
    return new Course({
      id: row.id,
      slug: new CourseSlug(row.slug),
      title: row.title,
      description: row.description,
      published: row.published,
      createdAt: row.createdAt,
    });
  }
}
