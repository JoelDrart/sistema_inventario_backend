/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @MinLength(2, { message: 'Contraseña invalida' })
  @IsString({ message: 'Contraseña invalida' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}

export class LoginAuthDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'Contraseña invalida' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}

export class AccessTokenDto {
  accessToken: string;
}
