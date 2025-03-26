import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [DrizzleModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
