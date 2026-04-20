/**
 * Composition Root
 *
 * The ONE place where concrete implementations are wired to application-layer
 * ports and repository interfaces. Interfaces layer imports ONLY tokens +
 * use cases, and resolves them through NestJS DI.
 *
 * Keeping this in infrastructure/ is correct: wiring is allowed to know about
 * every layer. Controllers and handlers never import adapters directly.
 */
import { Provider } from '@nestjs/common';
import { loadEnv } from '../config/env';
import { getPrisma } from '../persistence/PrismaClient';
import { getRedis } from '../cache/RedisClient';

import { PrismaUserRepository } from '../persistence/PrismaUserRepository';
import { PrismaCourseRepository } from '../persistence/PrismaCourseRepository';
import { PrismaLessonRepository } from '../persistence/PrismaLessonRepository';
import { PrismaEnrollmentRepository } from '../persistence/PrismaEnrollmentRepository';
import { PgVectorSearchAdapter } from '../persistence/PgVectorSearchAdapter';

import { AnthropicTutorAdapter } from '../ai/AnthropicTutorAdapter';
import { VoyageEmbeddingAdapter } from '../ai/VoyageEmbeddingAdapter';
import { MuxVideoAdapter } from '../media/MuxVideoAdapter';
import { R2StorageAdapter } from '../media/R2StorageAdapter';
import { ResendEmailAdapter } from '../email/ResendEmailAdapter';
import { PusherRealtimeAdapter } from '../realtime/PusherRealtimeAdapter';
import { MeilisearchAdapter } from '../search/MeilisearchAdapter';
import { RedisCacheAdapter } from '../cache/RedisCacheAdapter';
import { BullMqQueueAdapter } from '../queue/BullMqQueueAdapter';
import { WorkosAuthAdapter } from '../auth/WorkosAuthAdapter';

import { RecommendationDomainService } from '../../domain/services/RecommendationDomainService';
import { EnrollInCourseUseCase } from '../../application/use-cases/EnrollInCourseUseCase';
import { AskTutorUseCase } from '../../application/use-cases/AskTutorUseCase';
import { ListPublishedCoursesUseCase } from '../../application/use-cases/ListPublishedCoursesUseCase';
import { GenerateLessonEmbeddingUseCase } from '../../application/use-cases/GenerateLessonEmbeddingUseCase';
import { RecommendCoursesUseCase } from '../../application/use-cases/RecommendCoursesUseCase';

// ─── Injection tokens ────────────────────────────────────────────────
export const TOKENS = {
  UserRepo: Symbol('IUserRepository'),
  CourseRepo: Symbol('ICourseRepository'),
  LessonRepo: Symbol('ILessonRepository'),
  EnrollmentRepo: Symbol('IEnrollmentRepository'),
  AiTutor: Symbol('IAiTutorPort'),
  Embedding: Symbol('IEmbeddingPort'),
  VectorSearch: Symbol('IVectorSearchPort'),
  Video: Symbol('IVideoPort'),
  Storage: Symbol('IObjectStoragePort'),
  Email: Symbol('IEmailPort'),
  Realtime: Symbol('IRealtimePort'),
  SearchIndex: Symbol('ISearchIndexPort'),
  Cache: Symbol('ICachePort'),
  Queue: Symbol('IQueuePort'),
  Auth: Symbol('IAuthPort'),
  Recommender: Symbol('RecommendationDomainService'),

  // Use cases
  EnrollInCourse: Symbol('EnrollInCourseUseCase'),
  AskTutor: Symbol('AskTutorUseCase'),
  ListCourses: Symbol('ListPublishedCoursesUseCase'),
  GenLessonEmbedding: Symbol('GenerateLessonEmbeddingUseCase'),
  RecommendCourses: Symbol('RecommendCoursesUseCase'),
} as const;

// ─── Providers ───────────────────────────────────────────────────────
export function buildProviders(): Provider[] {
  const env = loadEnv();
  const prisma = getPrisma();
  const redis = getRedis(env.redisUrl);

  return [
    // Repositories
    { provide: TOKENS.UserRepo, useValue: new PrismaUserRepository(prisma) },
    { provide: TOKENS.CourseRepo, useValue: new PrismaCourseRepository(prisma) },
    { provide: TOKENS.LessonRepo, useValue: new PrismaLessonRepository(prisma) },
    { provide: TOKENS.EnrollmentRepo, useValue: new PrismaEnrollmentRepository(prisma) },
    { provide: TOKENS.VectorSearch, useValue: new PgVectorSearchAdapter(prisma) },

    // External adapters
    {
      provide: TOKENS.AiTutor,
      useValue: new AnthropicTutorAdapter(env.anthropic.apiKey, env.anthropic.model),
    },
    {
      provide: TOKENS.Embedding,
      useValue: new VoyageEmbeddingAdapter(env.voyage.apiKey, env.voyage.model),
    },
    {
      provide: TOKENS.Video,
      useValue: new MuxVideoAdapter(env.mux.tokenId, env.mux.tokenSecret),
    },
    {
      provide: TOKENS.Storage,
      useValue: new R2StorageAdapter(
        env.r2.accountId,
        env.r2.accessKeyId,
        env.r2.secretAccessKey,
        env.r2.bucket,
        env.r2.publicBaseUrl,
      ),
    },
    { provide: TOKENS.Email, useValue: new ResendEmailAdapter(env.resend.apiKey, env.resend.from) },
    {
      provide: TOKENS.Realtime,
      useValue: new PusherRealtimeAdapter(
        env.pusher.appId,
        env.pusher.key,
        env.pusher.secret,
        env.pusher.cluster,
      ),
    },
    {
      provide: TOKENS.SearchIndex,
      useValue: new MeilisearchAdapter(env.meili.host, env.meili.masterKey),
    },
    { provide: TOKENS.Cache, useValue: new RedisCacheAdapter(redis) },
    { provide: TOKENS.Queue, useValue: new BullMqQueueAdapter(redis) },
    {
      provide: TOKENS.Auth,
      useValue: new WorkosAuthAdapter(
        env.workos.apiKey,
        env.workos.clientId,
        env.workos.redirectUri,
      ),
    },

    // Domain services
    { provide: TOKENS.Recommender, useValue: new RecommendationDomainService() },

    // Use cases
    {
      provide: TOKENS.EnrollInCourse,
      inject: [
        TOKENS.UserRepo,
        TOKENS.CourseRepo,
        TOKENS.EnrollmentRepo,
        TOKENS.Email,
        TOKENS.Queue,
      ],
      useFactory: (u, c, e, em, q) => new EnrollInCourseUseCase(u, c, e, em, q),
    },
    {
      provide: TOKENS.AskTutor,
      inject: [
        TOKENS.LessonRepo,
        TOKENS.Embedding,
        TOKENS.VectorSearch,
        TOKENS.AiTutor,
        TOKENS.Realtime,
      ],
      useFactory: (l, emb, vs, t, r) => new AskTutorUseCase(l, emb, vs, t, r),
    },
    {
      provide: TOKENS.ListCourses,
      inject: [TOKENS.CourseRepo, TOKENS.Cache],
      useFactory: (c, cache) => new ListPublishedCoursesUseCase(c, cache),
    },
    {
      provide: TOKENS.GenLessonEmbedding,
      inject: [TOKENS.LessonRepo, TOKENS.Embedding, TOKENS.VectorSearch],
      useFactory: (l, e, v) => new GenerateLessonEmbeddingUseCase(l, e, v),
    },
    {
      provide: TOKENS.RecommendCourses,
      inject: [TOKENS.CourseRepo, TOKENS.EnrollmentRepo, TOKENS.Recommender],
      useFactory: (c, e, r) => new RecommendCoursesUseCase(c, e, r),
    },
  ];
}

export function exportedTokens(): symbol[] {
  return Object.values(TOKENS);
}
