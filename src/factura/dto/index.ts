import { IsOptional, IsString } from 'class-validator';

export class CreateFacturaDetalleDto {
  productoId: string;
  loteId: string;
  cantidad: number;
  precioUnitario: string;
  descuento: string;
  impuesto: string;
  subtotal: string;
}

export class CreateFacturaDto {
  @IsOptional()
  @IsString({ message: 'El id del empleado debe ser una cadena de texto' })
  id_Empleado?: string;
  clienteId: string;
  sucursalId: string;
  fecha: Date;
  subtotal: string;
  impuestoTotal?: string;
  descuento?: string;
  total: string;
  estado?: string;
  metodoPago?: string;
  observaciones?: string;
}
