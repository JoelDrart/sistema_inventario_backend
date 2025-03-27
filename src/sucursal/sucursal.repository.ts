import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { desc } from 'drizzle-orm';
import { CreateSucursalDto } from './dto';

@Injectable()
export class SucursalRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private async generateSucursalId(): Promise<string> {
    // 1. Buscar el último ID en la base de datos
    const lastSucursal = await this.db
      .select({ id: schema.sucursal.idSucursal })
      .from(schema.sucursal)
      .orderBy(desc(schema.sucursal.idSucursal))
      .limit(1);

    // 2. Si no hay registros, empezar desde 1
    if (lastSucursal.length === 0) {
      return 'suc001';
    }

    // 3. Extraer el número del último ID y aumentar en 1
    const lastId = lastSucursal[0].id;
    const lastNumber = parseInt(lastId.replace('suc', ''), 10);
    const nextNumber = lastNumber + 1;

    // 4. Formatear con ceros a la izquierda
    return `suc${nextNumber.toString().padStart(3, '0')}`;
  }

  async createSucursal(newSucursal: CreateSucursalDto): Promise<string> {
    return `Sucursal creada con ID: ${await this.generateSucursalId()}`;
  }
}
