import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { CreateProductoDto, ProductoResponseDto } from './dto';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async createProduct(
    createProductDto: CreateProductoDto,
    imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    try {
      let imageUrl = '';
      let imagePublicID = '';
      if (imageFile) {
        const uploadResult = await this.fileUploadService.uploadImageForEntity(
          imageFile,
          'products',
        );
        imageUrl = uploadResult.url;
        imagePublicID = uploadResult.publicId;
      }

      const newProducto = await this.db
        .insert(schema.producto)
        .values({
          idProducto: createProductDto.id,
          precio: createProductDto.precio,
          nombre: createProductDto.nombre,
          codigo: createProductDto.codigo,
          descripcion: createProductDto.descripcion,
          categoria: createProductDto.categoria,
          subcategoria: createProductDto.subcategoria,
          costoPromedio: createProductDto.costoPromedio,
          publicImageId: imagePublicID,
          impuesto: createProductDto.impuesto,
          unidadMedida: createProductDto.unidadMedida,
          imagenUrl: imageUrl,
        })
        .returning();

      return {
        status: 'success',
        data: {
          productos: {
            id: newProducto[0].idProducto,
            nombre: newProducto[0].nombre,
            codigo: newProducto[0].codigo,
            descripcion: newProducto[0].descripcion,
            categoria: newProducto[0].categoria,
            subcategoria: newProducto[0].subcategoria,
            precio: newProducto[0].precio,
            costoPromedio: newProducto[0].costoPromedio,
            impuesto: newProducto[0].impuesto,
            unidadMedida: newProducto[0].unidadMedida,
            imgUrl: imageUrl,
            publicId: imagePublicID,
          },
        },
        message: 'Producto creado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al crear el producto', {
        cause: err,
        description: err.message,
      });
    }
  }
}
