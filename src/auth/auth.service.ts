import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import {
  LoginAuthDto,
  LoginResponseDto,
  RegisterAuthDto,
  RegisterResponseDto,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../users/utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: RegisterAuthDto): Promise<RegisterResponseDto> {
    // console.log('user', user);
    try {
      const userExists = await this.usersService.userExists(user.email);
      if (userExists) {
        throw new Error(
          'El correo electrónico ya está en uso. Por favor, utiliza otro. O llame al administrador para recuperar su cuenta.',
        );
      }

      const userCreated = await this.usersService.createUser(user);
      if (!userCreated) {
        throw new Error(
          'Error al registrar el usuario. Por favor, intenta de nuevo.',
        );
      }

      return {
        status: 'success',
        data: userCreated,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'Error al registrar el usuario. Por favor, verifica los datos ingresados.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async signIn(user: LoginAuthDto): Promise<LoginResponseDto> {
    // TODO: Validar si el usuario está activo o no
    const userFound = await this.usersService.findUserByEmail(user.email);
    // console.log('userFound', userFound);
    if (!userFound) {
      throw new BadRequestException('Contraseña o email incorrecto');
    }
    const isPasswordValid = await comparePassword(
      user.password,
      userFound.password ?? '',
    );
    // console.log('isPasswordValid', isPasswordValid);
    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña o email incorrecto');
    }
    const payload = {
      id: userFound.id,
      email: userFound.email,
      rol: userFound.rol,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });
    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }
}
