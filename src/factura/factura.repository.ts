import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { ProductService } from 'src/product/product.service';
import { StockRepository } from 'src/stock/stock.repository';
import { v4 as uuidv4 } from 'uuid';
import { desc, sql } from 'drizzle-orm';

@Injectable()
export class FacturaRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
    private readonly productService: ProductService,
    private readonly stockRepository: StockRepository,
  ) {}

  generateIdFactura(): string {
    return uuidv4();
  }
  //TODO: tiens que agregar el numero de la sucursal en el numero, puedes pasar por parametro
  async generateNumFactura(): Promise<string | null> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

    const lastFactura = await this.db
      .select({ numFactura: schema.factura.numeroFactura })
      .from(schema.factura)
      .where(
        sql`EXTRACT(YEAR FROM fecha) = ${year} AND EXTRACT(MONTH FROM fecha) = ${month}`,
      )
      .orderBy(desc(schema.factura.numeroFactura))
      .limit(1);

    let sequence = 1;
    if (lastFactura.length > 0 && lastFactura[0].numFactura) {
      const lastSequence = parseInt(
        lastFactura[0].numFactura.split('-')[3],
        10,
      );
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `fac-${year}-${month}-${sequence.toString().padStart(6, '0')}`;
  }
}
