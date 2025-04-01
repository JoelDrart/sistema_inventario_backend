import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from 'src/db';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { StockProductoBodega } from './entity';
import { and, eq } from 'drizzle-orm';

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
      const id = this.generateId(idProducto, idBodega);
      const stockNuevo = await this.db
        .insert(schema.stock)
        .values({
          idStock: id,
          idProducto,
          idBodega,
          cantidad,
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
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating stock:', err.message);
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
}
