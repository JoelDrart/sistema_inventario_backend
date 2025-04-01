import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  Min,
  IsIn,
  Matches,
} from 'class-validator';
import { User } from '../entity/user.entity';
import { PaginationMeta } from '../../dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @Min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser texto' })
  @Min(3, { message: 'El apellido debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsString({ message: 'El documento de identidad debe ser texto' })
  @Matches(/^\d{10,13}$/, {
    message:
      'El documento debe contener solo números y tener entre 10 y 13 dígitos',
  })
  @IsNotEmpty({ message: 'El documento de identidad es requerido' })
  documentoIdentidad: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @Min(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  passwordHash: string;

  @IsString({ message: 'El rol debe ser texto' })
  @IsIn(['admin', 'employee', 'client'], { message: 'Rol no válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol: string;

  @IsString({ message: 'El ID de sucursal debe ser texto' })
  @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
  idSucursal: string;

  @IsDateString({}, { message: 'La fecha debe ser una cadena de fecha válida' })
  @IsNotEmpty({ message: 'La fecha de contratación es requerida' })
  fechaContratacion: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class AssignUserSucursalDto {
  @IsString({ message: 'El ID de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userId: string;

  @Matches(/^suc\d{3}$/, {
    message:
      'El ID de sucursal debe tener el formato "suc" seguido de 3 dígitos (ej. suc001)',
  })
  @IsString({ message: 'El ID de sucursal debe ser texto' })
  @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
  sucursalId: string;
}
export class UserResponseDto {
  status: string;
  data: User | null | User[];
  pagination?: PaginationMeta | null;
  message?: string;
}
