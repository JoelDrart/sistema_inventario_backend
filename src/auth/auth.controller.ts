import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto, LoginResponseDto, RegisterAuthDto } from './dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(200)
  signUp(@Body() userRegister: RegisterAuthDto) {
    // return `Vamos a registrarte con ${createAuthDto.email} y ${createAuthDto.password}`;
    return this.authService.signUp(userRegister);
  }

  @Post('login')
  @HttpCode(200)
  @Public()
  signIn(@Body() loginUser: LoginAuthDto): Promise<LoginResponseDto> {
    return this.authService.signIn(loginUser);
  }
}
