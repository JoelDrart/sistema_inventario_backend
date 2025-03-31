import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductoDto } from './dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  create(createProductDto: CreateProductoDto, imageFile?: Express.Multer.File) {
    return this.productRepository.createProduct(createProductDto, imageFile);
  }
}
