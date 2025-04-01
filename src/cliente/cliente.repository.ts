import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  ClienteResponseDto,
  CreateClienteDto,
  FilterClienteDto,
  UpdateClienteDto,
} from './dto';
import { and, desc, eq, ilike, like, sql, SQL } from 'drizzle-orm';
import { EntityStatus } from 'src/dto';

@Injectable()
export class ClienteRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private async clienteExists(id: string): Promise<boolean> {
    const cliente = await this.db
      .select({ id: schema.cliente.idCliente })
      .from(schema.cliente)
      .where(eq(schema.cliente.idCliente, id))
      .limit(1);
    return cliente.length > 0;
  }

  private async validateDNI(dni: string | undefined): Promise<boolean> {
    if (!dni) {
      return false;
    }
    const cliente = await this.db
      .select({ id: schema.cliente.documentoIdentidad })
      .from(schema.cliente)
      .where(eq(schema.cliente.documentoIdentidad, dni))
      .limit(1);
    return cliente.length > 0;
  }

  private async validateEmail(
    email: string | undefined | null,
  ): Promise<boolean> {
    if (!email) {
      return false;
    }

    const cliente = await this.db
      .select({ id: schema.cliente.email })
      .from(schema.cliente)
      .where(eq(schema.cliente.email, email))
      .limit(1);
    return cliente.length > 0;
  }

  private async generateId(): Promise<string> {
    try {
      const prefix = 'cli';
      const lastCliente = await this.db
        .select({ id: schema.cliente.idCliente })
        .from(schema.cliente)
        .orderBy(desc(schema.cliente.idCliente))
        .limit(1);

      if (lastCliente.length === 0) {
        return `${prefix}001`;
      }

      const lastId = parseInt(lastCliente[0].id.slice(3));
      const newId = String(lastId + 1).padStart(3, '0');
      return `${prefix}${newId}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Error al generar el ID del cliente');
    }
  }

  async create(createCliente: CreateClienteDto): Promise<ClienteResponseDto> {
    try {
      console.log('createCliente', createCliente);
      const clienteId = await this.generateId();
      const clienteExists = await this.clienteExists(clienteId);
      if (clienteExists) {
        throw new Error('El cliente ya existe');
      }
      const dniExists = await this.validateDNI(createCliente.dni);
      if (dniExists) {
        throw new Error(
          'El documento de identidad a ingresar ya está registrado',
        );
      }

      const emailExists = await this.validateEmail(createCliente.email);
      if (emailExists) {
        throw new Error('El correo electrónico a ingresar ya está registrado');
      }

      const newCliente = await this.db
        .insert(schema.cliente)
        .values({
          idCliente: clienteId,
          nombre: createCliente.nombre,
          apellido: createCliente.apellido,
          documentoIdentidad: createCliente.dni,
          email: createCliente.email,
          telefono: createCliente.telefono,
          direccion: createCliente.direccion,
          fechaRegistro: createCliente.fechaRegistro,
        })
        .returning();

      return {
        status: 'success',
        data: {
          clientes: {
            id: newCliente[0].idCliente,
            nombre: newCliente[0].nombre,
            apellido: newCliente[0].apellido,
            dni: newCliente[0].documentoIdentidad,
            email: newCliente[0].email,
            direccion: newCliente[0].direccion,
            telefono: newCliente[0].telefono,
            fechaRegistro: newCliente[0].fechaRegistro,
          },
        },
        message: 'Cliente creado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo ingresar al cliente, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async updateCliente(
    id: string,
    updateCliente: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    try {
      const currentCliente = await this.db
        .select()
        .from(schema.cliente)
        .where(eq(schema.cliente.idCliente, id))
        .limit(1);

      if (currentCliente.length === 0) {
        throw new Error('El cliente no existe');
      }

      // Only check DNI if it's being updated and is different
      if (
        updateCliente.dni &&
        updateCliente.dni !== currentCliente[0].documentoIdentidad
      ) {
        const dniExists = await this.validateDNI(updateCliente.dni);
        if (dniExists) {
          throw new Error(
            'El documento de identidad a ingresar ya está registrado',
          );
        }
      }

      // Only check email if it's being updated and is different
      if (
        updateCliente.email &&
        updateCliente.email !== currentCliente[0].email
      ) {
        const emailExists = await this.validateEmail(updateCliente.email);
        if (emailExists) {
          throw new Error(
            'El correo electrónico a ingresar ya está registrado',
          );
        }
      }

      // Build update object with only provided fields that are different
      const updateData: Partial<typeof updateCliente> = {};
      if (
        updateCliente.nombre &&
        updateCliente.nombre !== currentCliente[0].nombre
      ) {
        updateData.nombre = updateCliente.nombre;
      }
      if (
        updateCliente.apellido &&
        updateCliente.apellido !== currentCliente[0].apellido
      ) {
        updateData.apellido = updateCliente.apellido;
      }
      if (
        updateCliente.dni &&
        updateCliente.dni !== currentCliente[0].documentoIdentidad
      ) {
        updateData.dni = updateCliente.dni;
      }
      if (
        updateCliente.email &&
        updateCliente.email !== currentCliente[0].email
      ) {
        updateData.email = updateCliente.email;
      }
      if (
        updateCliente.telefono &&
        updateCliente.telefono !== currentCliente[0].telefono
      ) {
        updateData.telefono = updateCliente.telefono;
      }
      if (
        updateCliente.direccion &&
        updateCliente.direccion !== currentCliente[0].direccion
      ) {
        updateData.direccion = updateCliente.direccion;
      }
      if (
        updateCliente.fechaRegistro &&
        updateCliente.fechaRegistro !== currentCliente[0].fechaRegistro
      ) {
        updateData.fechaRegistro = updateCliente.fechaRegistro;
      }

      // Only perform update if there are changes
      if (Object.keys(updateData).length === 0) {
        return {
          status: 'success',
          data: {
            clientes: null,
          },
          message: 'No hay cambios que actualizar',
        };
      }

      const updatedCliente = await this.db
        .update(schema.cliente)
        .set(updateData)
        .where(eq(schema.cliente.idCliente, id))
        .returning();

      return {
        status: 'success',
        data: {
          clientes: {
            id: updatedCliente[0].idCliente,
            nombre: updatedCliente[0].nombre,
            apellido: updatedCliente[0].apellido,
            dni: updatedCliente[0].documentoIdentidad,
            email: updatedCliente[0].email,
            direccion: updatedCliente[0].direccion,
            telefono: updatedCliente[0].telefono,
            fechaRegistro: updatedCliente[0].fechaRegistro,
          },
        },
        message: 'Cliente actualizado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo actualizar el cliente, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async findClienteById(id: string): Promise<ClienteResponseDto> {
    try {
      const cliente = await this.db
        .select()
        .from(schema.cliente)
        .where(
          and(
            eq(schema.cliente.idCliente, id),
            eq(schema.cliente.estado, EntityStatus.ACTIVE), // Solo cliente activos
          ),
        )
        .limit(1);

      if (cliente.length === 0) {
        throw new Error('El cliente no existe');
      }

      return {
        status: 'success',
        data: {
          clientes: {
            id: cliente[0].idCliente,
            nombre: cliente[0].nombre,
            apellido: cliente[0].apellido,
            dni: cliente[0].documentoIdentidad,
            email: cliente[0].email,
            direccion: cliente[0].direccion,
            telefono: cliente[0].telefono,
            fechaRegistro: cliente[0].fechaRegistro,
          },
        },
        message: 'Cliente encontrado',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'No se pudo encontrar el cliente, intente de nuevo.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  async findAllClientes(
    filterDto: FilterClienteDto,
  ): Promise<ClienteResponseDto> {
    try {
      // Validación de parámetros
      if (filterDto.sortBy && !(filterDto.sortBy in schema.cliente)) {
        throw new BadRequestException(
          `Campo '${filterDto.sortBy}' no válido para ordenar`,
        );
      }

      if (
        filterDto.sortOrder &&
        !['asc', 'desc'].includes(filterDto.sortOrder)
      ) {
        throw new BadRequestException("sortOrder debe ser 'asc' o 'desc'");
      }

      const {
        nombre,
        apellido,
        dni,
        email,
        telefono,
        page,
        size,
        sortBy,
        sortOrder = 'desc',
      } = filterDto;

      // Construcción segura de condiciones
      const conditions: SQL<unknown>[] = [
        eq(schema.cliente.estado, EntityStatus.ACTIVE),
      ];

      if (nombre?.trim()) {
        conditions.push(ilike(schema.cliente.nombre, `%${nombre.trim()}%`));
      }

      if (apellido?.trim()) {
        conditions.push(ilike(schema.cliente.apellido, `%${apellido.trim()}%`));
      }

      if (dni?.trim()) {
        conditions.push(
          like(schema.cliente.documentoIdentidad, `%${dni.trim()}%`),
        );
      }

      if (email?.trim()) {
        conditions.push(like(schema.cliente.email, `%${email.trim()}%`));
      }

      if (telefono?.trim()) {
        conditions.push(like(schema.cliente.telefono, `%${telefono.trim()}%`));
      }

      console.log('conditions', conditions);

      // Consulta de conteo
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.cliente)
        .where(and(...conditions));

      const total = Number(totalResult[0].count);

      if (total === 0) {
        return {
          status: 'success',
          data: { clientes: [] },
          pagination: { total: 0, pages: 0, page, size },
          message: 'No se encontraron clientes',
        };
      }

      const totalPages = Math.ceil(total / size);
      if (page > totalPages) {
        return {
          status: 'fail',
          data: { clientes: [] },
          pagination: { total, pages: totalPages, page, size },
          message: `La página ${page} excede el total (${totalPages})`,
        };
      }

      // Ordenamiento seguro
      const orderByColumn =
        sortBy && schema.cliente[sortBy as keyof typeof schema.cliente];
      const orderBy = orderByColumn
        ? sortOrder === 'desc'
          ? sql`${orderByColumn} DESC`
          : sql`${orderByColumn} ASC`
        : sql`${schema.cliente.fechaRegistro} DESC`;

      // Consulta de datos
      const clientes = await this.db
        .select()
        .from(schema.cliente)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(size)
        .offset((page - 1) * size);

      // Mapeo de resultados
      const mappedClientes = clientes.map((c) => ({
        id: c.idCliente,
        nombre: c.nombre,
        apellido: c.apellido,
        dni: c.documentoIdentidad,
        email: c.email,
        direccion: c.direccion,
        telefono: c.telefono,
        fechaRegistro: c.fechaRegistro,
      }));

      return {
        status: 'success',
        data: { clientes: mappedClientes },
        pagination: { total, pages: totalPages, page, size },
        message: `Se encontraron ${total} clientes`,
      };
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException('Error al buscar clientes', {
        cause: err,
        description: err.message,
      });
    }
  }

  //TODO: Implementar el método de eliminar cliente (eliminar fisico si no tiene referencias en otros registros o eliminar logico si tiene referencias)
}
