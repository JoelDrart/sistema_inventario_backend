export class Cliente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fechaRegistro?: Date | string | null;
  estado?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
