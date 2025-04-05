import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class FacturaRepository {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
    private readonly productService: ProductService,
  ) {}
}
