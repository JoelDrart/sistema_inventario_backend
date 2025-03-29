export class User {
  id: string;
  name: string;
  apellido: string;
  dni?: string;
  fechaContratacion?: Date | string | null;
  email: string;
  password?: string;
  rol: string;
  estado?: string;
  idSucursal?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;

  //   constructor(id: number, name: string, email: string, password: string) {
  //     this.id = id;
  //     this.name = name;
  //     this.email = email;
  //     this.password = password;
  //     this.createdAt = new Date();
  //     this.updatedAt = new Date();
  //   }
}
