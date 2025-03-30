import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/authGuard.guard';
import { RolesGuard } from './auth/guard/rol.guard';
import { BodegaModule } from './bodega/bodega.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    SucursalModule,
    AuthModule,
    BodegaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
