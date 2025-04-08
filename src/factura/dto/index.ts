/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { FacturaCabeceraFormatted, FacturaFormatted } from '../entities';

export class CreateFacturaDetalleDto {
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío' })
  productoId: string;

  @IsOptional()
  @IsString({ message: 'El ID del lote debe ser una cadena de texto' })
  loteId?: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
  cantidad: number;

  @IsNumberString(
    {},
    { message: 'El precio unitario debe ser un número válido' },
  )
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return typeof value === 'number' || typeof value === 'string'
      ? String(value)
      : undefined;
  })
  @IsNotEmpty({ message: 'El precio unitario es requerido' })
  precioUnitario: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El descuento debe ser un número válido' })
  descuento?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El impuesto debe ser un número válido' })
  impuesto?: string;

  @IsNumberString({}, { message: 'El subtotal debe ser un número válido' })
  @IsNotEmpty({ message: 'El subtotal es requerido' })
  subtotal: string;
}

export class CreateFacturaDto {
  @IsOptional()
  @IsString({ message: 'El ID del empleado debe ser una cadena de texto' })
  id_Empleado?: string;

  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: string;

  @IsString({ message: 'El ID de la sucursal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la sucursal es requerido' })
  sucursalId: string;

  @IsDateString({}, { message: 'El formato de fecha debe ser YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  fecha: Date;

  @IsNumberString({}, { message: 'El subtotal debe ser un número válido' })
  @IsNotEmpty({ message: 'El subtotal es requerido' })
  subtotal: string;

  @IsOptional()
  @IsNumberString(
    {},
    { message: 'El impuesto total debe ser un número válido' },
  )
  impuestoTotal?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El descuento debe ser un número válido' })
  descuento?: string;

  @IsNumberString({}, { message: 'El total debe ser un número válido' })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value.toString();
    return value;
  })
  @IsNotEmpty({ message: 'El total es requerido' })
  total: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El método de pago debe ser una cadena de texto' })
  metodoPago?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;

  @IsArray({ message: 'Los detalles deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleDto)
  @IsNotEmpty({ message: 'Debe incluir al menos un detalle de factura' })
  detalles: CreateFacturaDetalleDto[];
}

export class UpdateFacturaDto extends PartialType(CreateFacturaDto) {}

export class FacturaFormattedResponseDto {
  status: string;
  data: {
    facturas: FacturaFormatted[] | FacturaFormatted | null;
  };
  message?: string;
}
interface PaginationMetadata {
  total: number;
  pages: number;
  page: number;
  size: number;
}

export class FacturaFormattedListResponseDto {
  status: string;
  data: {
    facturas: FacturaFormatted[] | null;
  };
  pagination?: PaginationMetadata;
  message?: string;
}

export class FacturaCabeceraFormattedListResponseDto {
  status: string;
  data: {
    facturas: FacturaCabeceraFormatted[] | null;
  };
  pagination?: PaginationMetadata;
  message?: string;
}
