export class FacturaCabecera {
  id: string;
  numeroFactura: string;
  empleadoId: string;
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
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

export class FacturaDetalle {
  id: string; //generado
  facturaId: string; //referencia a la cabecera
  productoId: string;
  loteId?: string;
  cantidad: number;
  precioUnitario: string;
  descuento?: string;
  impuesto?: string;
  subtotal: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class Factura {
  header: FacturaCabecera;
  details: FacturaDetalle[] = [];
}
export class FacturaCabeceraFormatted extends FacturaCabecera {
  cliente: string;
  empleado: string;
  sucursal: string;
}
export class FacturaDetalleFormatted extends FacturaDetalle {
  producto: string;
}

export class FacturaFormatted {
  header: FacturaCabeceraFormatted;
  details: FacturaDetalleFormatted[] = [];
}
