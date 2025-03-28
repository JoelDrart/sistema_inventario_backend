import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { desc } from 'drizzle-orm';
import { CreateSucursalDto, CreateSucursalResponseDto } from './dto';

@Injectable()
export class SucursalRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private async generateSucursalId(): Promise<string> {
    try {
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
      if (!lastId.toLowerCase().startsWith('suc')) {
        throw new Error('Invalid ID format');
      }

      const lastNumber = parseInt(lastId.toLowerCase().replace('suc', ''), 10);
      if (isNaN(lastNumber)) {
        throw new Error('Invalid number in ID');
      }

      const nextNumber = lastNumber + 1;

      // 4. Formatear con ceros a la izquierda
      return `suc${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Algo salió mal, intenta nuevamente',
        {
          cause: error,
          description: 'Error al generar el ID de la sucursal',
        },
      );
    }
  }

  async createSucursal(
    newSucursal: CreateSucursalDto,
  ): Promise<CreateSucursalResponseDto> {
    try {
      const sucursalId = await this.generateSucursalId();

      const sucursal = await this.db
        .insert(schema.sucursal)
        .values({
          idSucursal: sucursalId,
          nombre: newSucursal.nombre,
          direccion: newSucursal.direccion,
          telefono: newSucursal.telefono,
        })
        .returning();

      console.log('Sucursal creada:', sucursal);

      return {
        status: 'success',
        data: {
          nombre: sucursal[0].nombre,
          direccion: sucursal[0].direccion,
          telefono: sucursal[0].telefono,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la sucursal', {
        cause: error,
        description: 'No se pudo insertar la sucursal en la base de datos',
      });
    }
  }
}
