import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import {
  CreateSucursalDto,
  SucursalResponseDto,
  UpdateSucursalDto,
} from './dto';
import { Sucursal } from './entities';
import { PagePaginationDto, EntityStatus } from '../dto';

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

  private async idSucursalExists(id: string): Promise<boolean> {
    try {
      const sucursal = await this.db
        .select({ id: schema.sucursal.idSucursal })
        .from(schema.sucursal)
        .where(eq(schema.sucursal.idSucursal, id))
        .limit(1);

      return sucursal.length > 0;
    } catch (error) {
      throw new InternalServerErrorException('Error al verificar la sucursal', {
        cause: error,
        description: 'Error al verificar la existencia de la sucursal',
      });
    }
  }

  async createSucursal(
    newSucursal: CreateSucursalDto,
  ): Promise<SucursalResponseDto> {
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

  async findAllActiveSucursales(
    query: PagePaginationDto,
  ): Promise<SucursalResponseDto> {
    try {
      const { page, size } = query;
      const offset = (page - 1) * size;

      // Obtener total de registros para la metadata
      const totalResult = await this.db
        .select({ count: count() })
        .from(schema.sucursal)
        .where(eq(schema.sucursal.estado, 'activo'));

      const total = totalResult[0]?.count || 0;

      const sucursales = await this.db
        .select()
        .from(schema.sucursal)
        .where(eq(schema.sucursal.estado, 'activo'))
        .orderBy(asc(schema.sucursal.idSucursal))
        .limit(size)
        .offset(offset);

      if (sucursales.length === 0 && page === 1) {
        return {
          status: 'success',
          data: null,
          pagination: {
            total: 0,
            page,
            size,
            pages: 0,
          },
          message: 'No hay sucursales registradas',
        };
      }

      // Si se pide una página que no existe
      if (sucursales.length === 0 && page > 1) {
        return {
          status: 'success',
          data: null,
          pagination: {
            total,
            page,
            size,
            pages: Math.ceil(total / size),
          },
          message: 'No hay sucursales en esta página',
        };
      }

      const sucursalData = sucursales.map((sucursal) => {
        const sucursalEntity = new Sucursal();
        sucursalEntity.idSucursal = sucursal.idSucursal;
        sucursalEntity.nombre = sucursal.nombre;
        sucursalEntity.direccion = sucursal.direccion;
        sucursalEntity.telefono = sucursal.telefono;
        return sucursalEntity;
      });

      return {
        status: 'success',
        data: sucursalData,
        pagination: {
          total,
          page,
          size,
          pages: Math.ceil(total / size),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener sucursales, intenta de nuevo más tarde',
        {
          cause: error,
          description: 'No se pudo obtener la lista de sucursales',
        },
      );
    }
  }

  async updateSucursal(
    id: string,
    newSucursal: UpdateSucursalDto,
  ): Promise<SucursalResponseDto> {
    try {
      const sucursalExists = await this.idSucursalExists(id);

      if (!sucursalExists) {
        throw new BadRequestException('Sucursal no encontrada', {
          description: 'No se encontró la sucursal con el ID proporcionado',
        });
      }

      const updatedSucursal = await this.db
        .update(schema.sucursal)
        .set({
          nombre: newSucursal.nombre,
          direccion: newSucursal.direccion,
          telefono: newSucursal.telefono,
        })
        .where(eq(schema.sucursal.idSucursal, id))
        .returning();

      const sucursalData = new Sucursal();
      sucursalData.idSucursal = updatedSucursal[0].idSucursal;
      sucursalData.nombre = updatedSucursal[0].nombre;
      sucursalData.direccion = updatedSucursal[0].direccion;
      sucursalData.telefono = updatedSucursal[0].telefono;
      return {
        status: 'success',
        data: sucursalData,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la sucursal',
        {
          cause: error,
          description: 'No se pudo actualizar la sucursal en la base de datos',
        },
      );
    }
  }

  async deactivateSucursal(id: string): Promise<SucursalResponseDto> {
    try {
      const sucursalExists = await this.idSucursalExists(id);

      if (!sucursalExists) {
        throw new Error('Sucursal no encontrada');
      }

      await this.db
        .update(schema.sucursal)
        .set({ estado: EntityStatus.INACTIVE })
        .where(eq(schema.sucursal.idSucursal, id));

      return {
        status: 'success',
        data: null,
        message: 'Sucursal eliminada correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar la sucursal', {
        cause: error,
        description: 'No se pudo eliminar la sucursal de la base de datos',
      });
    }
  }

  async findOneSucursal(id: string): Promise<SucursalResponseDto> {
    try {
      const sucursal = await this.db
        .select()
        .from(schema.sucursal)
        .where(
          and(
            eq(schema.sucursal.idSucursal, id),
            eq(schema.sucursal.estado, 'activo'),
          ),
        )
        .limit(1);

      if (sucursal.length === 0) {
        return {
          status: 'error',
          data: null,
          message: 'Sucursal no encontrada',
        };
      }

      const sucursalData = new Sucursal();
      sucursalData.idSucursal = sucursal[0].idSucursal;
      sucursalData.nombre = sucursal[0].nombre;
      sucursalData.direccion = sucursal[0].direccion;
      sucursalData.telefono = sucursal[0].telefono;

      return {
        status: 'success',
        data: sucursalData,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener la sucursal', {
        cause: error,
        description: 'No se pudo obtener la sucursal de la base de datos',
      });
    }
  }
}
