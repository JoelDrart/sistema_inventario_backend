import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Bodega } from '../entities/bodega.entity';
import { PaginationMeta } from '../../dto';

export class IDBodegaDto {
  @IsString({ message: 'El ID de bodega debe ser una cadena de texto' })
  @Matches(/^bod\d{3}$/, {
    message:
      'El ID de bodega debe tener el formato "bod" seguido de 3 dígitos (ej. bod001)',
  })
  id: string;
}

export class CreateBodegaDto {
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Matches(/^suc\d{3}$/, {
    message:
      'El ID de sucursal debe tener el formato "suc" seguido de 3 dígitos (ej. suc001)',
  })
  @IsString({ message: 'El ID de sucursal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
  idSucursal: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser un booleano' })
  esPrincipal: boolean = false;

  @IsOptional()
  @MaxLength(100, {
    message: 'La descripción no debe exceder los 100 caracteres',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string = '';
}

export class UpdateBodegaDto extends PartialType(CreateBodegaDto) {}

export class BodegaResponseDto {
  status: string;
  data: Bodega | null | Bodega[];
  pagination?: PaginationMeta | null;
  message?: string;
}
