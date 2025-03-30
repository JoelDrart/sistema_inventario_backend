import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { User } from '../../users/entity/user.entity';

export class RegisterAuthDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @Matches(/^\d{10}$/, {
    message: 'El Documento de Identidad debe contener exactamente 10 números',
  })
  @IsString({ message: 'El Documento de Identidad debe ser texto' })
  @IsNotEmpty({ message: 'El Documento de Identidad es requerido' })
  dni: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fechaContratacion: Date | string | null = null;

  @IsOptional()
  @IsString({ message: 'El rol debe ser texto' })
  rol: string | null = null;

  @IsOptional()
  @IsString({ message: 'El ID de sucursal debe ser texto' })
  idSucursal: string | null = null;

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

export class LoginResponseDto {
  status: string;
  data: AccessTokenDto | null;
  message?: string;
}

export class AccessTokenDto {
  accessToken: string;
}

export class RegisterResponseDto {
  status: string;
  message: string;
  data: User | null;
}
