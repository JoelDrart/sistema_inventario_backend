import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { schema } from '../db';
import { CreateCompraDto, UpdateCompraDto } from './dto';
import { Compra, CompraFormatted } from './entities';
import { v4 as uuidv4 } from 'uuid';
import { desc, eq, or, sql } from 'drizzle-orm';
import { OrderStatus } from 'src/dto';
import { StockRepository } from 'src/stock/stock.repository';

@Injectable()
export class CompraRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
    private readonly stockRepository: StockRepository, // Cambiar por el tipo correcto
  ) {}

  generateIdCompra(): string {
    return uuidv4();
  }
  async generateNumFactura(): Promise<string> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    const lastCompra = await this.db
      .select({ numFactura: schema.compra.numeroFactura })
      .from(schema.compra)
      .where(
        sql`EXTRACT(YEAR FROM fecha) = ${year} AND EXTRACT(MONTH FROM fecha) = ${month}`,
      )
      .orderBy(desc(schema.compra.numeroFactura))
      .limit(1);

    let sequence = 1;
    if (lastCompra.length > 0 && lastCompra[0].numFactura) {
      const lastSequence = parseInt(lastCompra[0].numFactura.split('-')[3], 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `comp-${year}-${month}-${sequence.toString().padStart(6, '0')}`;
  }

  private generateIdLote(idProducto: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `${idProducto}-${timestamp}-${randomSuffix}`;
  }

  async createCompra(createCompra: CreateCompraDto): Promise<Compra> {
    return await this.db.transaction(async (tx) => {
      try {
        // console.log('Empezando transacción de compra...');
        const {
          id_Empleado,
          idProveedor,
          fecha,
          total,
          detalles,
          observacion,
        } = createCompra;

        if (!detalles || detalles.length === 0) {
          throw new Error('La compra debe tener al menos un detalle');
        }

        const idCompra = this.generateIdCompra();
        const numFactura = await this.generateNumFactura();

        const compraCabecera = await tx
          .insert(schema.compra)
          .values({
            idCompra,
            numeroFactura: numFactura,
            fecha,
            total,
            idEmpleado: id_Empleado,
            idProveedor,
            observaciones: observacion,
            estado: OrderStatus.PROCESSED,
          })
          .returning();

        const compraDetalles = await tx
          .insert(schema.compraDetalle)
          .values(
            detalles.map((detalle) => {
              const { idBodega, cantidad, costoUnitario, idProducto } = detalle;

              if (!idBodega || !cantidad || !costoUnitario || !idProducto) {
                throw new Error('Datos del detalle incompletos');
              }

              const idLote = this.generateIdLote(idProducto);
              return {
                idLote,
                idCompra,
                idProducto,
                idBodega,
                cantidad,
                costoUnitario,
                cantidadDisponible:
                  detalle.cantidadDisponible || detalle.cantidad,
              };
            }),
          )
          .returning();

        // console.log('Transacción de compra completada con éxito:');

        //Actualizar stock de productos en la bodega
        for (const detalle of compraDetalles) {
          if (!detalle.idBodega || !detalle.idProducto) {
            throw new Error('ID de bodega o producto no puede ser nulo');
          }
          await this.stockRepository.ajustarStock(
            tx, // Pasamos la transacción
            detalle.idBodega,
            detalle.idProducto,
            detalle.cantidad,
          );
        }

        return {
          header: {
            id: idCompra,
            numeroFactura: numFactura,
            idProveedor: compraCabecera[0].idProveedor || '', // Aseguramos que nunca sea null
            id_Empleado: compraCabecera[0].idEmpleado || '',
            fecha,
            total,
            observacion,
            estado: compraCabecera[0].estado || OrderStatus.PROCESSED, // Valor por defecto
            createdAt: compraCabecera[0].createdAt,
            updatedAt: compraCabecera[0].updatedAt,
          },
          details: compraDetalles.map((detalle) => ({
            idLote: detalle.idLote,
            idCompra: detalle.idCompra!,
            idProducto: detalle.idProducto!,
            idBodega: detalle.idBodega!,
            cantidad: detalle.cantidad,
            costoUnitario: detalle.costoUnitario,
            cantidadDisponible: detalle.cantidadDisponible || 0,
          })),
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.log('Transacción fallida, revertiendo cambios...');
        console.log('Error en la transacción de compra:', error);
        throw new BadRequestException('Error al crear la compra', {
          cause: err,
          description: err.message,
        });
      }
    });
  }

  async updateCompra(
    idCompra: string,
    updateCompra: UpdateCompraDto,
  ): Promise<Compra> {
    return await this.db.transaction(async (tx) => {
      try {
        const {
          id_Empleado,
          idProveedor,
          fecha,
          total,
          detalles,
          observacion,
        } = updateCompra;

        // Verificar si la compra existe
        const existingCompra = await tx
          .select()
          .from(schema.compra)
          .where(eq(schema.compra.idCompra, idCompra))
          .limit(1);

        if (!existingCompra.length) {
          throw new Error('Compra no encontrada');
        }

        // Actualizar cabecera de compra solo con los campos proporcionados
        const updateValues: Partial<typeof schema.compra.$inferInsert> = {};
        if (fecha) updateValues.fecha = fecha;
        if (total) updateValues.total = total;
        if (id_Empleado) updateValues.idEmpleado = id_Empleado;
        if (idProveedor) updateValues.idProveedor = idProveedor;
        if (observacion !== undefined) updateValues.observaciones = observacion;

        const compraCabecera = await tx
          .update(schema.compra)
          .set(updateValues)
          .where(eq(schema.compra.idCompra, idCompra))
          .returning();

        let compraDetalles: {
          idCompra: string | null;
          createdAt: string | null;
          updatedAt: string | null;
          idLote: string;
          idProducto: string | null;
          idBodega: string | null;
          cantidad: number;
          cantidadDisponible: number | null;
          costoUnitario: string;
          fechaCaducidad: string | null;
          fechaRecepcion: string | null;
        }[] = [];
        // Actualizar detalles solo si se proporcionaron
        if (detalles && detalles.length > 0) {
          // Obtener detalles existentes
          const detallesAnteriores = await tx
            .select()
            .from(schema.compraDetalle)
            .where(eq(schema.compraDetalle.idCompra, idCompra));

          // Crear mapas para facilitar las búsquedas
          const mapaDetallesAnteriores = new Map(
            detallesAnteriores.map((d) => [`${d.idProducto}-${d.idBodega}`, d]),
          );

          // Procesar cada detalle nuevo
          for (const detalle of detalles) {
            const { idBodega, cantidad, costoUnitario, idProducto } = detalle;
            if (!idBodega || !cantidad || !costoUnitario || !idProducto) {
              throw new Error('Datos del detalle incompletos');
            }

            const key = `${idProducto}-${idBodega}`;
            const detalleAnterior = mapaDetallesAnteriores.get(key);

            if (detalleAnterior) {
              // Actualizar detalle existente
              const diferencia = cantidad - detalleAnterior.cantidad;

              if (
                diferencia !== 0 ||
                costoUnitario !== detalleAnterior.costoUnitario
              ) {
                await tx
                  .update(schema.compraDetalle)
                  .set({
                    cantidad,
                    costoUnitario,
                    cantidadDisponible: detalle.cantidadDisponible || cantidad,
                    updatedAt: new Date().toISOString(),
                  })
                  .where(
                    eq(schema.compraDetalle.idLote, detalleAnterior.idLote),
                  );

                // Actualizar stock solo si cambió la cantidad
                if (diferencia !== 0) {
                  await this.stockRepository.ajustarStock(
                    tx,
                    idBodega,
                    idProducto,
                    diferencia,
                  );
                }
              }

              // Marcar como procesado
              mapaDetallesAnteriores.delete(key);
            } else {
              // Insertar nuevo detalle
              const idLote = this.generateIdLote(idProducto);
              await tx.insert(schema.compraDetalle).values({
                idLote,
                idCompra,
                idProducto,
                idBodega,
                cantidad,
                costoUnitario,
                cantidadDisponible: detalle.cantidadDisponible || cantidad,
              });

              // Ajustar stock para el nuevo detalle
              await this.stockRepository.ajustarStock(
                tx,
                idBodega,
                idProducto,
                cantidad,
              );
            }
          }

          // Obtener todos los detalles actualizados
          compraDetalles = await tx
            .select()
            .from(schema.compraDetalle)
            .where(eq(schema.compraDetalle.idCompra, idCompra));
        }

        return {
          header: {
            id: idCompra,
            numeroFactura: compraCabecera[0].numeroFactura || '',
            idProveedor: compraCabecera[0].idProveedor || '', // Aseguramos que nunca sea null
            id_Empleado: compraCabecera[0].idEmpleado || '',
            fecha: compraCabecera[0].fecha,
            total: compraCabecera[0].total,
            observacion: compraCabecera[0].observaciones || '',
            estado: compraCabecera[0].estado || OrderStatus.PROCESSED, // Valor por defecto
            createdAt: compraCabecera[0].createdAt,
            updatedAt: compraCabecera[0].updatedAt,
          },
          details: compraDetalles.map((detalle) => ({
            idLote: detalle.idLote,
            idCompra: detalle.idCompra!,
            idProducto: detalle.idProducto!,
            idBodega: detalle.idBodega!,
            cantidad: detalle.cantidad,
            costoUnitario: detalle.costoUnitario,
            cantidadDisponible: detalle.cantidadDisponible || 0,
          })),
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.log(
          'Transacción de actualización fallida, revertiendo cambios...',
        );
        console.log('Error:', error);
        throw new BadRequestException('Error al actualizar la compra', {
          cause: err,
          description: err.message,
        });
      }
    });
  }

  async validateProveedor(idProveedor: string): Promise<boolean> {
    const proveedor = await this.db
      .select()
      .from(schema.proveedor)
      .where(eq(schema.proveedor.idProveedor, idProveedor))
      .limit(1);

    return proveedor.length > 0;
  }

  async validateProductoBodega(
    idProducto: string,
    idBodega: string,
  ): Promise<boolean> {
    const producto = await this.db
      .select()
      .from(schema.producto)
      .where(eq(schema.producto.idProducto, idProducto))
      .limit(1);

    if (producto.length === 0) {
      return false;
    }

    const bodega = await this.db
      .select()
      .from(schema.bodega)
      .where(eq(schema.bodega.idBodega, idBodega))
      .limit(1);

    return bodega.length > 0;
  }

  async validateCompra(idCompra: string): Promise<boolean> {
    const compra = await this.db
      .select()
      .from(schema.compra)
      .where(eq(schema.compra.idCompra, idCompra))
      .limit(1);

    return compra.length > 0;
  }

  async validateNumFactura(numFactura: string): Promise<boolean> {
    const compra = await this.db
      .select()
      .from(schema.compra)
      .where(eq(schema.compra.numeroFactura, numFactura))
      .limit(1);

    return compra.length > 0;
  }

  async validateCompraOrNumeroFactura(id: string): Promise<boolean> {
    const existsIdCompra = await this.validateCompra(id);
    const existsNumFactura = await this.validateNumFactura(id);
    return existsIdCompra || existsNumFactura;
  }

  // Agregar después de validateCompra()
  async anularCompra(idCompra: string): Promise<Compra> {
    return await this.db.transaction(async (tx) => {
      try {
        // Verificar si la compra existe y obtener su estado actual
        const compraExistente = await tx
          .select()
          .from(schema.compra)
          .where(eq(schema.compra.idCompra, idCompra))
          .limit(1);

        if (!compraExistente.length) {
          throw new Error('Compra no encontrada');
        }

        if (compraExistente[0].estado === OrderStatus.ANULATED) {
          throw new Error('La compra ya está anulada');
        }

        // Obtener detalles de la compra
        const detallesCompra = await tx
          .select()
          .from(schema.compraDetalle)
          .where(eq(schema.compraDetalle.idCompra, idCompra));

        // Verificar si algún lote ya fue utilizado en facturas
        for (const detalle of detallesCompra) {
          const lotesUtilizados = await tx
            .select()
            .from(schema.facturaDetalle)
            .where(eq(schema.facturaDetalle.idLote, detalle.idLote))
            .limit(1);

          if (lotesUtilizados.length > 0) {
            throw new Error(
              `No se puede anular la compra porque el lote ${detalle.idLote} ya ha sido facturado`,
            );
          }
        }

        // Actualizar estado de la compra
        const compraActualizada = await tx
          .update(schema.compra)
          .set({
            estado: OrderStatus.ANULATED,
            observaciones: 'Compra anulada',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.compra.idCompra, idCompra))
          .returning();

        // Revertir el stock para cada detalle
        for (const detalle of detallesCompra) {
          if (detalle.idBodega && detalle.idProducto) {
            await this.stockRepository.ajustarStock(
              tx,
              detalle.idBodega,
              detalle.idProducto,
              -detalle.cantidad, // Restamos la cantidad para revertir el stock
            );
          }
        }

        // Retornar la compra actualizada con sus detalles
        return {
          header: {
            id: idCompra,
            numeroFactura: compraActualizada[0].numeroFactura || '',
            idProveedor: compraActualizada[0].idProveedor || '',
            id_Empleado: compraActualizada[0].idEmpleado || '',
            fecha: compraActualizada[0].fecha,
            total: compraActualizada[0].total,
            observacion: compraActualizada[0].observaciones || '',
            estado: compraActualizada[0].estado || OrderStatus.ANULATED,
            createdAt: compraActualizada[0].createdAt,
            updatedAt: compraActualizada[0].updatedAt,
          },
          details: detallesCompra.map((detalle) => ({
            idLote: detalle.idLote,
            idCompra: detalle.idCompra!,
            idProducto: detalle.idProducto!,
            idBodega: detalle.idBodega!,
            cantidad: detalle.cantidad,
            costoUnitario: detalle.costoUnitario,
            cantidadDisponible: detalle.cantidadDisponible || 0,
          })),
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.log('Error al anular la compra:', error);
        throw new BadRequestException('Error al anular la compra', {
          cause: err,
          description: err.message,
        });
      }
    });
  }

  async getCompraById(idCompra: string): Promise<CompraFormatted | null> {
    const compra = await this.db
      .select()
      .from(schema.compra)
      .where(
        or(
          eq(schema.compra.idCompra, idCompra),
          eq(schema.compra.numeroFactura, idCompra),
        ),
      )
      .limit(1);

    if (compra.length === 0) {
      console.log('Compra no encontrada');
      return null;
    }

    const nombreProveedor = await this.getNombreProveedorById(
      compra[0].idProveedor || '',
    );

    const nombreEmpleado = await this.getNombreEmpleadoById(
      compra[0].idEmpleado || '',
    );

    type DetalleWithNames = typeof schema.compraDetalle.$inferSelect & {
      producto?: string | null;
      bodega?: string | null;
    };

    const detalles: DetalleWithNames[] = await this.db
      .select()
      .from(schema.compraDetalle)
      .where(eq(schema.compraDetalle.idCompra, compra[0].idCompra));

    if (detalles.length === 0) {
      console.log('Detalles de la compra no encontrados');
      return null;
    }

    // Obtener los nombres de los productos y bodegas
    for (const detalle of detalles) {
      const nombreProducto = await this.getNombreProductoById(
        detalle.idProducto || '',
      );
      const nombreBodega = await this.getNombreBodegaById(
        detalle.idBodega || '',
      );

      detalle.producto = nombreProducto;
      detalle.bodega = nombreBodega;
    }

    return {
      header: {
        id: compra[0].idCompra,

        numeroFactura: compra[0].numeroFactura || '',
        idProveedor: compra[0].idProveedor || '',
        proveedor: nombreProveedor || '',
        id_Empleado: compra[0].idEmpleado || '',
        empleado: nombreEmpleado || '',
        fecha: compra[0].fecha,
        total: compra[0].total,
        observacion: compra[0].observaciones || '',
        estado: compra[0].estado || OrderStatus.PROCESSED,
        createdAt: compra[0].createdAt,
        updatedAt: compra[0].updatedAt,
      },
      details: detalles.map((detalle) => ({
        idLote: detalle.idLote,
        idCompra: detalle.idCompra!,
        idProducto: detalle.idProducto!,
        producto: detalle.producto || null,

        idBodega: detalle.idBodega!,

        bodega: detalle.bodega || null,
        cantidad: detalle.cantidad,
        costoUnitario: detalle.costoUnitario,
        cantidadDisponible: detalle.cantidadDisponible || 0,
      })),
    };
  }

  getCompras() {
    return 'ssd';
  }

  async getNombreEmpleadoById(idEmpleado: string): Promise<string | null> {
    const empleado = await this.db
      .select({
        nombre: schema.empleado.nombre,
        apellido: schema.empleado.apellido,
      })
      .from(schema.empleado)
      .where(eq(schema.empleado.idEmpleado, idEmpleado))
      .limit(1);

    return empleado.length > 0
      ? `${empleado[0].nombre} ${empleado[0].apellido}`
      : null;
  }

  async getNombreProveedorById(idProveedor: string): Promise<string | null> {
    const proveedor = await this.db
      .select({
        nombre: schema.proveedor.nombre,
      })
      .from(schema.proveedor)
      .where(eq(schema.proveedor.idProveedor, idProveedor))
      .limit(1);

    return proveedor.length > 0 ? proveedor[0].nombre : null;
  }

  async getNombreBodegaById(idBodega: string): Promise<string | null> {
    const bodega = await this.db
      .select({
        nombre: schema.bodega.nombre,
      })
      .from(schema.bodega)
      .where(eq(schema.bodega.idBodega, idBodega))
      .limit(1);

    return bodega.length > 0 ? bodega[0].nombre : null;
  }

  async getNombreProductoById(idProducto: string): Promise<string | null> {
    const producto = await this.db
      .select({
        nombre: schema.producto.nombre,
      })
      .from(schema.producto)
      .where(eq(schema.producto.idProducto, idProducto))
      .limit(1);

    return producto.length > 0 ? producto[0].nombre : null;
  }
}
