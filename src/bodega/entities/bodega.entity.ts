export class Bodega {
  id: string | null;
  nombre: string | null;
  idSucursal: string | null;
  esPrincipal: boolean | null;
  descripcion?: string | null;
  estado?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  constructor() {
    this.id = null;
    this.nombre = null;
    this.idSucursal = null;
    this.esPrincipal = false;
    this.descripcion = null;
    this.estado = null;
    this.created_at = null;
    this.updated_at = null;
  }
}
