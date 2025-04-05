import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [FileUploadModule, StockModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
