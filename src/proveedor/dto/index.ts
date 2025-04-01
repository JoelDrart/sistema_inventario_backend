import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Proveedor } from '../entities/proveedor.entity';

export class ProveedorIdDto {
  @IsString({ message: 'El ID de proveedor debe ser un string' })
  @Matches(/^prov\d{3}$/, {
    message:
      'El ID de proveedor debe tener el formato "prov" seguido de 3 dígitos (ej. prov001)',
  })
  id: string;
}

export class CreateProveedorDto {
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @Matches(/^\d{10,13}$/, {
    message:
      'El documento debe contener solo números y tener entre 10 y 13 dígitos',
  })
  @IsString({ message: 'El DNI debe ser texto' })
  @IsOptional()
  dni?: string;

  @Length(2, 100, { message: 'El contacto debe tener hasta 100 caracteres' })
  @IsOptional()
  contacto?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'El teléfono debe ser un número válido',
  })
  @IsString({ message: 'El teléfono debe ser texto' })
  @MinLength(9, { message: 'El teléfono debe tener al menos 9 caracteres' })
  telefono?: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion?: string;
}

export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {}

export class ProveedorResponseDto {
  status: string;
  data: { proveedores: Proveedor[] | null | Proveedor };
  pagination?: {
    total: number;
    pages: number;
    page: number;
    size: number;
  } | null;
  message?: string;
}
