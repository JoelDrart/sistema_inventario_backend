import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import {
  CategoriasResponseDto,
  CreateProductoDto,
  FilterProductoDto,
  ProductoResponseDto,
  StockParamsDto,
} from './dto';
import {
  StockProductoBodegaDto,
  StockProductoBodegaResponseDto,
} from '../stock/dto';
import { StockRepository } from '../stock/stock.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository,
  ) {}

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

  async createStock(
    stock: StockProductoBodegaDto,
  ): Promise<StockProductoBodegaResponseDto> {
    try {
      const { idProducto, idBodega, cantidad } = stock;

      if (await this.stockRepository.stockExists(idProducto, idBodega)) {
        const newStock = await this.stockRepository.setStock(
          idProducto,
          idBodega,
          cantidad,
        );
        if (!newStock) {
          throw new Error('No se pudo actualizar el stock');
        }

        return {
          status: 'success',
          data: {
            stock: newStock,
          },
          message: 'Stock actualizado correctamente',
        };
      }
      const newStock = await this.stockRepository.createStock(
        idProducto,
        idBodega,
        cantidad,
      );

      if (!newStock) {
        throw new BadRequestException('No se pudo crear el stock');
      }
      return {
        status: 'success',
        data: {
          stock: newStock,
        },
        message: 'Stock creado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating stock:', err.message);
      throw new BadRequestException('Ocurrió un error al crear el stock', {
        cause: err,
        description: err.message,
      });
    }
  }

  async getStock(
    params: StockParamsDto,
  ): Promise<StockProductoBodegaResponseDto> {
    try {
      const { idProducto, idBodega } = params;
      const stock = await this.stockRepository.getStock(idProducto, idBodega);
      if (!stock) {
        throw new Error('No se encontró el stock');
      }
      return {
        status: 'success',
        data: {
          stock,
        },
        message: 'Stock encontrado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error getting stock:', err.message);
      throw new BadRequestException(
        'Ocurrió un error al obtener el stock, intente de nuevo más tarde.',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  //Funciones de utilidad para el manejo de productos
}
