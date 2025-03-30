import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'), // Obtiene JWT_SECRET de las variables de entorno
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService], // Inyecta ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], // Exporta AuthService y JwtModule para que puedan ser utilizados en otros módulos
})
export class AuthModule {}
