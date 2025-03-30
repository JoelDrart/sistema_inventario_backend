import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { schema } from '../db';
import { asc, count, desc, eq } from 'drizzle-orm';
import { BodegaResponseDto, CreateBodegaDto } from './dto';
import { Bodega } from './entities/bodega.entity';
import { EntityStatus, PagePaginationDto } from '../dto';

@Injectable()
export class BodegaRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private async generateBodegaId(): Promise<string> {
    const lastBodega = await this.db
      .select({ id: schema.bodega.idBodega })
      .from(schema.bodega)
      .orderBy(desc(schema.bodega.idBodega))
      .limit(1);

    if (lastBodega.length === 0) {
      return 'bod001';
    }

    const lastId = lastBodega[0].id;
    if (!lastId.toLowerCase().startsWith('bod')) {
      throw new Error('Invalid ID format');
    }

    const lastNumber = parseInt(lastId.toLowerCase().replace('bod', ''), 10);
    if (isNaN(lastNumber)) {
      throw new Error('Invalid number in ID');
    }

    const nextNumber = lastNumber + 1;

    return `bod${nextNumber.toString().padStart(3, '0')}`;
  }

  private async bodegaExists(id: string): Promise<boolean> {
    const bodega = await this.db
      .select({ id: schema.bodega.idBodega })
      .from(schema.bodega)
      .where(eq(schema.bodega.idBodega, id))
      .limit(1);

    return bodega.length > 0;
  }

  async createBodega(newBodega: CreateBodegaDto): Promise<BodegaResponseDto> {
    try {
      const bodegaId = await this.generateBodegaId();

      const bodega = await this.db
        .insert(schema.bodega)
        .values({
          idBodega: bodegaId,
          nombre: newBodega.nombre,
          descripcion: newBodega.descripcion,
          esPrincipal: newBodega.esPrincipal,
        })
        .returning();

      const bodegaData = new Bodega();
      bodegaData.id = bodega[0].idBodega;
      bodegaData.nombre = bodega[0].nombre;
      bodegaData.idSucursal = bodega[0].idSucursal;
      bodegaData.descripcion = bodega[0].descripcion;
      bodegaData.esPrincipal = bodega[0].esPrincipal;
      bodegaData.estado = bodega[0].estado;

      return {
        status: 'success',
        data: bodegaData,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al crear la bodega', {
        cause: err,
        description: err.message,
      });
    }
  }

  async findAllActiveBodegas(
    query: PagePaginationDto,
  ): Promise<BodegaResponseDto> {
    try {
      const { page, size } = query;
      const offset = (page - 1) * size;

      const totalResult = await this.db
        .select({ count: count() })
        .from(schema.bodega)
        .where(eq(schema.bodega.estado, EntityStatus.ACTIVE));

      const total = totalResult[0]?.count || 0;

      const bodegas = await this.db
        .select()
        .from(schema.bodega)
        .where(eq(schema.bodega.estado, EntityStatus.ACTIVE))
        .orderBy(asc(schema.bodega.idBodega))
        .limit(size)
        .offset(offset);

      if (bodegas.length === 0) {
        return {
          status: 'success',
          data: null,
          pagination: {
            total: 0,
            page,
            size,
            pages: 0,
          },
          message: 'No hay bodegas registradas',
        };
      }

      if (bodegas.length === 0 && page > 1) {
        return {
          status: 'success',
          data: null,
          pagination: {
            total,
            page,
            size,
            pages: Math.ceil(total / size),
          },
          message: 'No hay bodegas en esta página',
        };
      }

      const bodegasData = bodegas.map((bodega) => {
        const bodegaData = new Bodega();
        bodegaData.id = bodega.idBodega;
        bodegaData.nombre = bodega.nombre;
        bodegaData.idSucursal = bodega.idSucursal;
        bodegaData.descripcion = bodega.descripcion;
        bodegaData.esPrincipal = bodega.esPrincipal;
        bodegaData.estado = bodega.estado;
        return bodegaData;
      });

      return {
        status: 'success',
        data: bodegasData,
        pagination: {
          total,
          page,
          size,
          pages: Math.ceil(total / size),
        },
      };
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo obtener la lista de sucursales, intenta de nuevo más tarde.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }
}
