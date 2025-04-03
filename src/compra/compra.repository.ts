import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { schema } from '../db';
import { CreateCompraDto } from './dto';
import { Compra } from './entities';
import { v4 as uuidv4 } from 'uuid';
import { desc, sql } from 'drizzle-orm';
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
                cantidadDisponible: detalle.cantidadDisponible || 0,
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
            idProveedor,
            id_Empleado: id_Empleado || '',
            fecha,
            total,
            observacion,
            estado: OrderStatus.PROCESSED,
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
}
