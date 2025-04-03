export class CompraCabecera {
  id: string;
  numeroFactura: string;
  idProveedor: string;
  id_Empleado: string;
  fecha: Date | string;
  total: string;
  observacion?: string | null;
  estado?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class CompraDetalle {
  idLote: string;
  idCompra: string;
  idProducto: string;
  idBodega: string;
  cantidad: number;
  costoUnitario: string;
  cantidadDisponible?: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class Compra {
  header: CompraCabecera;
  details: CompraDetalle[] = [];
}

export class CompraCabeceraFormatted {
  id: string;
  numeroFactura: string;
  idProveedor: string;
  proveedor: string;
  id_Empleado: string;
  empleado: string;
  fecha: Date | string;
  total: string;
  observacion?: string | null;
  estado?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class CompraDetalleFormatted {
  idLote: string;
  idCompra: string;
  idProducto: string;
  producto: string | null;
  idBodega: string;
  bodega: string | null;
  cantidad: number;
  costoUnitario: string;
  cantidadDisponible?: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export class CompraFormatted {
  header: CompraCabeceraFormatted;
  details: CompraDetalleFormatted[] = [];
}
