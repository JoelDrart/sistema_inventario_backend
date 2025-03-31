export class Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  costoPromedio?: number | null;
  impuesto: number | null;
  unidadMedida: string;
  imgUrl?: string | null;
  publicId?: string | null;
  estado?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
