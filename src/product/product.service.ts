import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import {
  CategoriasResponseDto,
  CreateProductoDto,
  FilterProductoDto,
  ProductoResponseDto,
} from './dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  create(
    createProductDto: CreateProductoDto,
    imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    return this.productRepository.createProduct(createProductDto, imageFile);
  }

  update(
    id: string,
    updateProductDto: CreateProductoDto,
    imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    return this.productRepository.updateProduct(
      id,
      updateProductDto,
      imageFile,
    );
  }
  findOneById(id: string): Promise<ProductoResponseDto> {
    return this.productRepository.findProductById(id);
  }

  findAll(filterDto: FilterProductoDto): Promise<ProductoResponseDto> {
    return this.productRepository.findAllProducts(filterDto);
  }
  delete(id: string): Promise<ProductoResponseDto> {
    return this.productRepository.deleteProduct(id);
  }

  getCategorias(): Promise<CategoriasResponseDto> {
    return this.productRepository.getAllCategories();
  }
}
