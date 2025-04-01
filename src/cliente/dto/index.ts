import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Cliente } from '../entity';
import { Type } from 'class-transformer';

export class ClienteIdDto {
  @IsString({ message: 'El ID de cliente debe ser un string' })
  @Matches(/^cli\d{3}$/, {
    message:
      'El ID de cliente debe tener el formato "cli" seguido de 3 dígitos (ej. cli001)',
  })
  id: string;
}

export class CreateClienteDto {
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  apellido: string;

  @Length(10, 13, { message: 'El DNI debe tener 10 caracteres' })
  @IsString({ message: 'El DNI debe ser texto' })
  @IsNotEmpty({ message: 'El DNI no puede estar vacío' })
  dni: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string; // Sin valor por defecto

  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'El teléfono debe ser un número válido',
  })
  @IsString({ message: 'El teléfono debe ser texto' })
  @MinLength(9, { message: 'El teléfono debe tener al menos 9 caracteres' })
  telefono?: string; // Sin valor por defecto

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion?: string; // Sin valor por defecto

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido' })
  fechaRegistro?: string; // Sin valor por defecto
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}

export class ClienteResponseDto {
  status: string;
  data: { clientes: Cliente | null | Cliente[] };
  pagination?: {
    total: number;
    pages: number;
    page: number;
    size: number;
  } | null;
  message?: string;
}

export class FilterClienteDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto' })
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser texto' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El email debe ser texto' })
  email?: string; // Sin valor por defecto

  @IsOptional()
  @MaxLength(10, {
    message: 'El teléfono no debe exceder los 10 caracteres',
  })
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El número de página debe ser mayor o igual a 1' })
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El tamaño de página debe ser mayor o igual a 1' })
  @Max(100, { message: 'El tamaño de página no debe exceder 100' })
  @Type(() => Number)
  size: number = 10;

  @IsOptional()
  @IsString({ message: 'El campo de búsqueda debe ser texto' })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: 'El orden debe ser texto y debe ser asc o desc' })
  sortOrder?: 'asc' | 'desc';
}
