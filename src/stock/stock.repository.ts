import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from 'src/db';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { StockProductoBodega } from './entity';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgTransaction } from 'src/dto/drizzle.types';

@Injectable()
export class StockRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  private generateId(idProducto: string, idBodega: string) {
    const id = `${idProducto}-${idBodega}`;
    return id;
  }

  /**
   * Crea un stock de un producto en una bodega, solo si no existe ese stock.
   * @returns {StockProductoBodega | null} - Datos stock creado o null si algo pasó mal y no envió un error.
   * @throws {Error} - Si ocurre un error al crear el producto.
   */
  async createStock(
    idProducto: string,
    idBodega: string,
    cantidad: number = 0,
  ): Promise<StockProductoBodega | null> {
    try {
      //verificar si existe la bodega y el producto
      const producto = await this.db
        .select()
        .from(schema.producto)
        .where(eq(schema.producto.idProducto, idProducto))
        .execute();
      if (!producto[0]) {
        throw new Error('El producto no existe');
      }
      const bodega = await this.db
        .select()
        .from(schema.bodega)
        .where(eq(schema.bodega.idBodega, idBodega))
        .execute();
      if (!bodega[0]) {
        throw new Error('La bodega no existe');
      }

      const id = this.generateId(idProducto, idBodega);

      const unidadMedida = await this.db
        .select({ unidadMedida: schema.producto.unidadMedida })
        .from(schema.producto)
        .where(eq(schema.producto.idProducto, idProducto));

      const stockNuevo = await this.db
        .insert(schema.stock)
        .values({
          idStock: id,
          idProducto,
          idBodega,
          cantidad,
          unidadMedida: unidadMedida[0]?.unidadMedida,
        })
        .returning();

      if (!stockNuevo[0].idProducto || !stockNuevo[0].idBodega) {
        return null;
      }

      return {
        id: stockNuevo[0].idStock,
        idProducto: stockNuevo[0].idProducto,
        idBodega: stockNuevo[0].idBodega,
        cantidad: stockNuevo[0].cantidad,
        unidadMedida: stockNuevo[0].unidadMedida,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating stock Repo:', err.message);
      throw new Error(err.message);
    }
  }
  /**
   * Actualiza el stock de un producto en una bodega, solo si ya existe ese stock.
   * @returns {StockProductoBodega | null} - Datos stock creado o null si algo pasó mal y no envió un error.
   * @throws {Error} - Si ocurre un error al crear el producto.
   */
  async setStock(
    idProducto: string,
    idBodega: string,
    cantidad: number,
  ): Promise<StockProductoBodega | null> {
    try {
      const stock = await this.db
        .update(schema.stock)
        .set({ cantidad })
        .where(
          and(
            eq(schema.stock.idProducto, idProducto),
            eq(schema.stock.idBodega, idBodega),
          ),
        )
        .returning();

      if (!stock[0] || !stock[0].idProducto || !stock[0].idBodega) {
        return null;
      }
      return {
        id: stock[0].idStock,
        idProducto: stock[0].idProducto,
        idBodega: stock[0].idBodega,
        cantidad: stock[0].cantidad,
      };
    } catch (error) {
      console.error('Error inserting stock:', error);
      throw new Error('Ocurrió un error al registrar el stock');
    }
  }

  async stockExists(idProducto: string, idBodega: string): Promise<boolean> {
    try {
      const stock = await this.db
        .select()
        .from(schema.stock)
        .where(
          and(
            eq(schema.stock.idProducto, idProducto),
            eq(schema.stock.idBodega, idBodega),
          ),
        )
        .limit(1)
        .execute();

      return stock.length > 0;
    } catch (error) {
      console.error('Error checking stock existence:', error);
      throw new Error('Ocurrió un error al verificar la existencia del stock');
    }
  }

  async getStock(
    idProducto: string,
    idBodega: string,
  ): Promise<StockProductoBodega | null> {
    try {
      const stock = await this.db
        .select()
        .from(schema.stock)
        .where(
          and(
            eq(schema.stock.idProducto, idProducto),
            eq(schema.stock.idBodega, idBodega),
          ),
        )
        .execute();

      if (!stock[0] || !stock[0].idProducto || !stock[0].idBodega) {
        return null;
      }

      return {
        id: stock[0].idStock,
        idProducto: stock[0].idProducto,
        idBodega: stock[0].idBodega,
        cantidad: stock[0].cantidad,
        unidadMedida: stock[0].unidadMedida,
      };
    } catch (error) {
      console.error('Error getting stock:', error);
      throw new Error('Ocurrió un error al obtener el stock');
    }
  }
  /**
   * Ajusta el stock de un producto en una bodega
   * @param tx Transacción opcional
   * @param idBodega ID de la bodega
   * @param idProducto ID del producto
   * @param cantidad Cantidad a ajustar (positivo para aumentar, negativo para disminuir)
   */
  async ajustarStock(
    tx: NodePgDatabase<typeof schema> | NodePgTransaction,
    idBodega: string,
    idProducto: string,
    cantidad: number,
  ): Promise<StockProductoBodega> {
    const db = (tx || this.db) as NodePgDatabase<typeof schema>;

    // Verificar si existe el stock
    const existe = await this.stockExists(idProducto, idBodega);

    if (!existe) {
      // Crear registro de stock si no existe
      await this.createStock(idProducto, idBodega, cantidad);
    }

    // Actualizar el stock
    const [stockActualizado] = await db
      .update(schema.stock)
      .set({
        cantidad: sql`${schema.stock.cantidad} + ${cantidad}`,
      })
      .where(
        and(
          eq(schema.stock.idProducto, idProducto),
          eq(schema.stock.idBodega, idBodega),
        ),
      )
      .returning();

    if (
      !stockActualizado ||
      !stockActualizado.idProducto ||
      !stockActualizado.idBodega
    ) {
      throw new Error('No se pudo actualizar el stock');
    }

    return {
      id: stockActualizado.idStock,
      idProducto: stockActualizado.idProducto,
      idBodega: stockActualizado.idBodega,
      cantidad: stockActualizado.cantidad,
      unidadMedida: stockActualizado.unidadMedida,
    };
  }
}
