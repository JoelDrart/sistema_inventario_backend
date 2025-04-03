export class CompraCabecera {
  id: string;
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
