import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guard/authGuard.guard';
import { RolesGuard } from './auth/guard/rol.guard';
import { BodegaModule } from './bodega/bodega.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ProductModule } from './product/product.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { StockModule } from './stock/stock.module';
import { CompraModule } from './compra/compra.module';
import { EmpleadoInterceptor } from './common/interceptors/empleado.interceptor';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    SucursalModule,
    AuthModule,
    BodegaModule,
    CloudinaryModule,
    FileUploadModule,
    ProductModule,
    ClienteModule,
    ProveedorModule,
    StockModule,
    CompraModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: EmpleadoInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
