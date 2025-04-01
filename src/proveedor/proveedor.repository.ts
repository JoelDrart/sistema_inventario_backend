import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import {
  CreateProveedorDto,
  ProveedorResponseDto,
  UpdateProveedorDto,
} from './dto';
import { EntityStatus, PagePaginationDto } from '../dto';

@Injectable()
export class ProveedorRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private async generateId() {
    try {
      const prefix = 'prov';
      const lastProveedor = await this.db
        .select({ id: schema.proveedor.idProveedor })
        .from(schema.proveedor)
        .orderBy(desc(schema.proveedor.idProveedor))
        .limit(1);

      if (lastProveedor.length === 0) {
        return `${prefix}001`;
      }

      const lastIdString = lastProveedor[0].id.toString();
      const lastId = parseInt(lastIdString.substring(4));
      const newId = String(lastId + 1).padStart(3, '0');
      return `${prefix}${newId}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Error al generar el ID del proveedor');
    }
  }

  private async proveedorExists(id: string): Promise<boolean> {
    const proveedor = await this.db
      .select({ id: schema.proveedor.idProveedor })
      .from(schema.proveedor)
      .where(eq(schema.proveedor.idProveedor, id))
      .limit(1);
    return proveedor.length > 0;
  }

  async createProveedor(
    createProveedor: CreateProveedorDto,
  ): Promise<ProveedorResponseDto> {
    try {
      const id = await this.generateId();
      const proveedorExists = await this.proveedorExists(id);
      if (proveedorExists) {
        throw new Error('El proveedor ya existe, intente con otro ID.');
      }
      const newProveedor = await this.db
        .insert(schema.proveedor)
        .values({
          idProveedor: id,
          nombre: createProveedor.nombre,
          documentoIdentidad: createProveedor.dni,
          contacto: createProveedor.contacto,
          telefono: createProveedor.telefono,
          email: createProveedor.email,
          direccion: createProveedor.direccion,
        })
        .returning();

      return {
        status: 'success',
        data: {
          proveedores: {
            id: newProveedor[0].idProveedor,
            nombre: newProveedor[0].nombre,
            dni: newProveedor[0].documentoIdentidad,
            contacto: newProveedor[0].contacto,
            telefono: newProveedor[0].telefono,
            email: newProveedor[0].email,
            direccion: newProveedor[0].direccion,
          },
        },
        message: 'Proveedor creado exitosamente',
      };
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo ingresar el proveedor, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async updateProveedor(
    id: string,
    updateProveedor: UpdateProveedorDto,
  ): Promise<ProveedorResponseDto> {
    try {
      const currentProveedor = await this.db
        .select()
        .from(schema.proveedor)
        .where(eq(schema.proveedor.idProveedor, id))
        .limit(1);

      if (currentProveedor.length === 0) {
        throw new Error('El proveedor no existe, verifique el ID.');
      }

      const updateData: Partial<typeof updateProveedor> = {};
      if (
        updateProveedor.nombre &&
        updateProveedor.nombre !== currentProveedor[0].nombre
      ) {
        updateData.nombre = updateProveedor.nombre;
      }
      if (
        updateProveedor.dni &&
        updateProveedor.dni !== currentProveedor[0].documentoIdentidad
      ) {
        updateData.dni = updateProveedor.dni;
      }
      if (
        updateProveedor.contacto &&
        updateProveedor.contacto !== currentProveedor[0].contacto
      ) {
        updateData.contacto = updateProveedor.contacto;
      }
      if (
        updateProveedor.telefono &&
        updateProveedor.telefono !== currentProveedor[0].telefono
      ) {
        updateData.telefono = updateProveedor.telefono;
      }
      if (
        updateProveedor.email &&
        updateProveedor.email !== currentProveedor[0].email
      ) {
        updateData.email = updateProveedor.email;
      }
      if (
        updateProveedor.direccion &&
        updateProveedor.direccion !== currentProveedor[0].direccion
      ) {
        updateData.direccion = updateProveedor.direccion;
      }

      if (Object.keys(updateData).length === 0) {
        return {
          status: 'success',
          data: {
            proveedores: null,
          },
          message: 'No se realizaron cambios en el proveedor.',
        };
      }

      const updatedProveedor = await this.db
        .update(schema.proveedor)
        .set(updateData)
        .where(eq(schema.proveedor.idProveedor, id))
        .returning();

      return {
        status: 'success',
        data: {
          proveedores: {
            id: updatedProveedor[0].idProveedor,
            nombre: updatedProveedor[0].nombre,
            dni: updatedProveedor[0].documentoIdentidad,
            contacto: updatedProveedor[0].contacto,
            telefono: updatedProveedor[0].telefono,
            email: updatedProveedor[0].email,
            direccion: updatedProveedor[0].direccion,
          },
        },
        message: 'Proveedor actualizado exitosamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo actualizar el proveedor, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async findProveedorById(id: string): Promise<ProveedorResponseDto> {
    try {
      const proveedor = await this.db
        .select()
        .from(schema.proveedor)
        .where(
          and(
            eq(schema.proveedor.idProveedor, id),
            eq(schema.proveedor.estado, EntityStatus.ACTIVE),
          ),
        )
        .limit(1);

      if (proveedor.length === 0) {
        throw new Error('El proveedor no existe, verifique el ID.');
      }

      return {
        status: 'success',
        data: {
          proveedores: {
            id: proveedor[0].idProveedor,
            nombre: proveedor[0].nombre,
            dni: proveedor[0].documentoIdentidad,
            contacto: proveedor[0].contacto,
            telefono: proveedor[0].telefono,
            email: proveedor[0].email,
            direccion: proveedor[0].direccion,
          },
        },
        message: 'Proveedor encontrado',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo encontrar el proveedor, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async findAllProveedores(
    query: PagePaginationDto,
  ): Promise<ProveedorResponseDto> {
    try {
      const { page, size } = query;
      const offset = (page - 1) * size;

      const totalResult = await this.db
        .select({ count: count() })
        .from(schema.proveedor)
        .where(eq(schema.proveedor.estado, EntityStatus.ACTIVE));

      const total = totalResult[0]?.count || 0;

      const proveedores = await this.db
        .select()
        .from(schema.proveedor)
        .where(eq(schema.proveedor.estado, EntityStatus.ACTIVE))
        .orderBy(asc(schema.proveedor.idProveedor))
        .limit(size)
        .offset(offset);

      if (proveedores.length === 0) {
        return {
          status: 'success',
          data: { proveedores: null },
          pagination: {
            total: 0,
            page,
            size,
            pages: 0,
          },
          message: 'No hay proveedores registrados',
        };
      }

      if (proveedores.length === 0 && page > 1) {
        return {
          status: 'success',
          data: { proveedores: null },
          pagination: {
            total,
            page,
            size,
            pages: Math.ceil(total / size),
          },
          message: 'No hay proveedores en esta página',
        };
      }
      const proveedoresData = proveedores.map((proveedor) => ({
        id: proveedor.idProveedor,
        nombre: proveedor.nombre,
        dni: proveedor.documentoIdentidad,
        contacto: proveedor.contacto,
        telefono: proveedor.telefono,
        email: proveedor.email,
        direccion: proveedor.direccion,
      }));

      return {
        status: 'success',
        data: { proveedores: proveedoresData },
        pagination: {
          total,
          page,
          size,
          pages: Math.ceil(total / size),
        },
        message: 'Proveedores encontrados',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo encontrar los proveedores, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }
}
