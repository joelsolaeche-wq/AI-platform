#!/usr/bin/env node
/**
 * CLI entry point. Thin wrapper: parses args → calls a use case.
 *
 * Usage:
 *   pnpm cli list-courses
 *   pnpm cli enqueue-embedding <lessonId>
 */
import 'reflect-metadata';
import { loadEnv } from '../../infrastructure/config/env';
import { getPrisma } from '../../infrastructure/persistence/PrismaClient';
import { getRedis } from '../../infrastructure/cache/RedisClient';
import { PrismaCourseRepository } from '../../infrastructure/persistence/PrismaCourseRepository';
import { RedisCacheAdapter } from '../../infrastructure/cache/RedisCacheAdapter';
import { BullMqQueueAdapter } from '../../infrastructure/queue/BullMqQueueAdapter';
import { ListPublishedCoursesUseCase } from '../../application/use-cases/ListPublishedCoursesUseCase';

async function main(): Promise<void> {
  const env = loadEnv();
  const [, , cmd, ...args] = process.argv;

  const prisma = getPrisma();
  const redis = getRedis(env.redisUrl);

  switch (cmd) {
    case 'list-courses': {
      const useCase = new ListPublishedCoursesUseCase(
        new PrismaCourseRepository(prisma),
        new RedisCacheAdapter(redis),
      );
      const courses = await useCase.execute({ limit: 50, offset: 0 });
      // eslint-disable-next-line no-console
      console.table(courses.map((c) => ({ id: c.id, slug: c.slug, title: c.title })));
      break;
    }

    case 'enqueue-embedding': {
      const lessonId = args[0];
      if (!lessonId) throw new Error('Usage: cli enqueue-embedding <lessonId>');
      const queue = new BullMqQueueAdapter(redis);
      await queue.enqueue('generate-lesson-embedding', { lessonId });
      // eslint-disable-next-line no-console
      console.log(`✓ enqueued embedding job for lesson ${lessonId}`);
      break;
    }

    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown command: ${cmd}\nAvailable: list-courses, enqueue-embedding`);
      process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
