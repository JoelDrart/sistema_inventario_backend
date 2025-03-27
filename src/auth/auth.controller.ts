import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  signUp(@Body() userRegister: RegisterAuthDto) {
    // return `Vamos a registrarte con ${createAuthDto.email} y ${createAuthDto.password}`;
    return this.authService.signUp(userRegister);
  }

  @Post('login')
  signIn(@Body() createAuthDto: RegisterAuthDto) {
    return `Vamos a loguearte con ${createAuthDto.email} y ${createAuthDto.password}`;
    // return this.authService.create(createAuthDto);
  }
}
