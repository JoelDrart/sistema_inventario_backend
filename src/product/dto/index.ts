import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Product } from '../entity';
import { PaginationMeta } from '../../dto';
import { Transform } from 'class-transformer';

export class CreateProductoDto {
  @MaxLength(10, { message: 'El ID no debe exceder los 10 caracteres' })
  @MinLength(3, { message: 'El ID debe tener al menos 3 caracteres' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID es requerido' })
  id: string = 'productox';

  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsOptional()
  @MaxLength(50, { message: 'El código no debe exceder los 50 caracteres' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  codigo: string = '';

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string = '';

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La categoría no debe exceder los 50 caracteres' })
  @MinLength(3, { message: 'La categoría debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoria: string;

  @MaxLength(50, {
    message: 'La subcategoría no debe exceder los 50 caracteres',
  })
  @MinLength(3, { message: 'La subcategoría debe tener al menos 3 caracteres' })
  @IsString({ message: 'La subcategoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La subcategoría es requerida' })
  subcategoria: string;

  @IsNumberString({}, { message: 'El precio debe ser un número válido' })
  @Transform(({ value }) => {
    // Convierte number a string si es necesario
    if (typeof value === 'number') return value.toString();
    return value;
  })
  @ValidateIf((_, value) => value !== undefined)
  precio: string;

  @IsOptional()
  @IsNumberString(
    {},
    { message: 'El costo promedio debe ser un número válido' },
  )
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return value.toString();
    return value;
  })
  costoPromedio?: string;

  @IsNumberString({}, { message: 'El impuesto debe ser un número válido' })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value.toString();
    return value;
  })
  impuesto: string;

  @IsString({ message: 'La unidad de medida debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  unidadMedida: string = 'unidad';

  @IsOptional()
  imagenPublicId?: string;

  @IsOptional()
  imagenUrl?: string;
}

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}

export class ProductoResponseDto {
  status: string;
  data: { productos: Product | null | Product[] };
  pagination?: PaginationMeta | null;
  message?: string;
}
