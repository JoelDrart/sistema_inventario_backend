import { Module } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CompraController } from './compra.controller';
import { CompraRepository } from './compra.repository';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [StockModule],
  controllers: [CompraController],
  providers: [CompraService, CompraRepository],
})
export class CompraModule {}
