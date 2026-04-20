/**
 * BullMQ worker entry point.
 *
 * Workers live in the interfaces layer because they are adapters that translate
 * external events (queued jobs) into use case invocations. They contain no
 * business logic.
 */
import 'reflect-metadata';
import { Worker, Job } from 'bullmq';
import { initDatadog } from '../../infrastructure/observability/Datadog';
import { initSentry, Sentry } from '../../infrastructure/observability/Sentry';
import { loadEnv } from '../../infrastructure/config/env';
import { getRedis } from '../../infrastructure/cache/RedisClient';
import { getPrisma } from '../../infrastructure/persistence/PrismaClient';

import { PrismaLessonRepository } from '../../infrastructure/persistence/PrismaLessonRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/PrismaUserRepository';
import { PrismaCourseRepository } from '../../infrastructure/persistence/PrismaCourseRepository';
import { PgVectorSearchAdapter } from '../../infrastructure/persistence/PgVectorSearchAdapter';
import { VoyageEmbeddingAdapter } from '../../infrastructure/ai/VoyageEmbeddingAdapter';
import { ResendEmailAdapter } from '../../infrastructure/email/ResendEmailAdapter';
import { MeilisearchAdapter } from '../../infrastructure/search/MeilisearchAdapter';

import { GenerateLessonEmbeddingUseCase } from '../../application/use-cases/GenerateLessonEmbeddingUseCase';

const env = loadEnv();
initDatadog(env.datadog.service + '-worker', env.datadog.env);
initSentry(env.sentry.dsn, env.nodeEnv);

const redis = getRedis(env.redisUrl);
const prisma = getPrisma();

// Wire adapters + use cases
const lessonRepo = new PrismaLessonRepository(prisma);
const userRepo = new PrismaUserRepository(prisma);
const courseRepo = new PrismaCourseRepository(prisma);
const vectorSearch = new PgVectorSearchAdapter(prisma);
const embedding = new VoyageEmbeddingAdapter(env.voyage.apiKey, env.voyage.model);
const email = new ResendEmailAdapter(env.resend.apiKey, env.resend.from);
const search = new MeilisearchAdapter(env.meili.host, env.meili.masterKey);

const generateLessonEmbedding = new GenerateLessonEmbeddingUseCase(
  lessonRepo,
  embedding,
  vectorSearch,
);

async function handle(job: Job): Promise<void> {
  switch (job.name) {
    case 'generate-lesson-embedding': {
      const { lessonId } = job.data as { lessonId: string };
      await generateLessonEmbedding.execute({ lessonId });
      return;
    }

    case 'send-welcome-email': {
      const { userId, courseId } = job.data as { userId: string; courseId: string };
      const user = await userRepo.findById(userId);
      const course = await courseRepo.findById(courseId);
      if (!user || !course) return;
      await email.send({
        to: user.email.value,
        subject: `Welcome to ${course.title}`,
        html: `<h1>Welcome, ${user.name}!</h1><p>You've enrolled in <strong>${course.title}</strong>. Happy learning!</p>`,
      });
      return;
    }

    case 'reindex-course': {
      const { courseId } = job.data as { courseId: string };
      const course = await courseRepo.findById(courseId);
      if (!course) return;
      await search.indexCourse({
        id: course.id,
        title: course.title,
        description: course.description,
      });
      return;
    }

    case 'process-mux-webhook': {
      // Hook up Mux asset ingestion → lesson.attachVideo via a dedicated use case.
      return;
    }

    default:
      throw new Error(`Unknown job: ${job.name}`);
  }
}

const worker = new Worker('ai-learning', handle, {
  connection: redis,
  concurrency: 5,
});

worker.on('failed', (job, err) => {
  Sentry.captureException(err, { extra: { jobId: job?.id, name: job?.name } });
  // eslint-disable-next-line no-console
  console.error(`[worker] job ${job?.name} failed:`, err.message);
});

worker.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log('🐂 BullMQ worker ready (queue: ai-learning)');
});
