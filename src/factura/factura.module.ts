import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { FacturaRepository } from './factura.repository';
import { StockModule } from '../stock/stock.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [StockModule, ProductModule],
  controllers: [FacturaController],
  providers: [FacturaService, FacturaRepository],
})
export class FacturaModule {}
