import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { buildProviders } from '../../infrastructure/di/CompositionRoot';
import { CoursesController } from './controllers/courses.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { TutorController } from './controllers/tutor.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { HealthController } from './controllers/health.controller';
import { MuxWebhookController } from './controllers/mux-webhook.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    HealthController,
    CoursesController,
    EnrollmentsController,
    TutorController,
    RecommendationsController,
    MuxWebhookController,
  ],
  providers: [...buildProviders()],
})
export class AppModule {}
