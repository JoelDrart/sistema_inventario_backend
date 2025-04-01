import { Module } from '@nestjs/common';
// import { StockService } from './stock.service';
// import { StockController } from './stock.controller';
import { StockRepository } from './stock.repository';

@Module({
  providers: [StockRepository],
  exports: [StockRepository],
})
export class StockModule {}
