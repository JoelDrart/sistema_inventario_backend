import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db/index';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select({
        id: schema.empleado.idEmpleado,
        email: schema.empleado.email,
        dni: schema.empleado.documentoIdentidad,
        rol: schema.empleado.rol,
        state: schema.empleado.estado,
        firstName: schema.empleado.nombre,
        lastName: schema.empleado.apellido,
      })
      .from(schema.empleado)
      .where(eq(schema.empleado.email, email));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.firstName,
      apellido: user.lastName,
      dni: user.dni,
      rol: user.rol ?? '',
      estado: user.state ?? '',
    };
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select({
        id: schema.empleado.idEmpleado,
        email: schema.empleado.email,
        dni: schema.empleado.documentoIdentidad,
        rol: schema.empleado.rol,
        state: schema.empleado.estado,
        firstName: schema.empleado.nombre,
        lastName: schema.empleado.apellido,
      })
      .from(schema.empleado)
      .where(eq(schema.empleado.idEmpleado, id));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.firstName,
      apellido: user.lastName,
      dni: user.dni,
      rol: user.rol ?? '',
      estado: user.state ?? '',
    };
  }
}
