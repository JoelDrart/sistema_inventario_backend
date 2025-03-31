export class Product {
  id: string;
  nombre: string | null;
  codigo?: string | null;
  descripcion?: string | null;
  categoria: string | null;
  subcategoria: string | null;
  precio: number | string;
  costoPromedio?: number | string | null;
  impuesto: number | string | null;
  unidadMedida: string | null;
  imgUrl?: string | null;
  publicId?: string | null;
  estado?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
