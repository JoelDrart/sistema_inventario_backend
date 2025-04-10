/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
  Matches,
  IsNumberString,
  ValidateIf,
  IsInt,
  Max,
} from 'class-validator';
import { Compra, CompraCabecera, CompraFormatted } from '../entities';

export class CreateCompraDetalleDto {
  //El id Lote será generado
  //   @IsString()
  //   @IsNotEmpty({ message: 'El idLote no puede estar vacío' })
  //   idLote: string;

  @IsString()
  @IsNotEmpty({ message: 'El idProducto no puede estar vacío' })
  idProducto: string;

  @IsString()
  @IsNotEmpty({ message: 'El idBodega no puede estar vacío' })
  idBodega: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
  cantidad: number;

  @IsNumberString(
    {},
    { message: 'El costo unitario debe ser un número válido' },
  )
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return value.toString();
  })
  @IsNotEmpty({ message: 'El costo unitario es requerido' })
  costoUnitario: string;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad disponible debe ser un número' })
  @Min(0, { message: 'La cantidad disponible no puede ser negativa' })
  cantidadDisponible?: number;
}

export class CreateCompraDto {
  @IsOptional()
  @IsString({ message: 'El idCompra debe ser una cadena de texto' })
  idCompra?: string;

  @IsString()
  @IsNotEmpty({ message: 'El idProveedor no puede estar vacío' })
  idProveedor: string;

  @IsOptional()
  @IsString({ message: 'El id del empleado debe ser una cadena de texto' })
  id_Empleado?: string;

  @IsDateString({}, { message: 'El formato de fecha debe ser YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fecha: string;

  @IsNumberString({}, { message: 'El total debe ser un número válido' })
  @Transform(({ value }) => {
    // Convierte number a string si es necesario
    if (typeof value === 'number') return value.toString();
    return value;
  })
  @ValidateIf((_, value) => value !== undefined)
  total: string;

  @IsOptional()
  @IsString({ message: 'La observación debe ser texto' })
  observacion?: string;

  @IsArray({ message: 'Los detalles deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  @IsNotEmpty({ message: 'Debe incluir al menos un detalle de compra' })
  detalles: CreateCompraDetalleDto[];
}

export class UpdateCompraDto extends PartialType(CreateCompraDto) {}

export class CompraResponseDto {
  status: string;
  data: {
    compras: Compra[] | Compra | null;
  };
  message?: string;
}

export interface PaginationMetadata {
  total: number;
  pages: number;
  page: number;
  size: number;
}

export class CompraResponseFormattedDto {
  status: string;
  data: {
    compras: CompraFormatted[] | CompraFormatted | null;
  };
  pagination?: PaginationMetadata;
  message?: string;
}

export class CompraResponseListDto {
  status: string;
  data: CompraCabecera[] | null;
  message?: string;
}

export class FilterCompraDto {
  @IsOptional()
  @IsString({ message: 'El numero de factura debe ser una cadena de texto' })
  numeroFacturaCompra?: string;

  @IsOptional()
  @IsString({ message: 'El idProveedor debe ser una cadena de texto' })
  idProveedor?: string;

  @IsOptional()
  @IsString({ message: 'El idEmpleado debe ser una cadena de texto' })
  empleado?: string;

  @IsOptional()
  @IsDateString({}, { message: 'El formato de fecha debe ser YYYY-MM-DD' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El producto debe ser una cadena de texto' })
  producto?: string;

  @IsOptional()
  @IsString({ message: 'La bodega debe ser una cadena de texto' })
  bodega?: string;

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
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
