import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  CategoriasResponseDto,
  CreateProductoDto,
  FilterProductoDto,
  ProductoResponseDto,
  UpdateProductoDto,
} from './dto';
import { and, asc, eq, like, sql, SQL } from 'drizzle-orm';
import { Product } from './entity';
import { EntityStatus } from 'src/dto';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private async validateProductId(id: string): Promise<void> {
    const product = await this.db
      .select()
      .from(schema.producto)
      .where(eq(schema.producto.idProducto, id))
      .limit(1);

    if (product.length > 0) {
      throw new Error('Ya existe un producto con este ID');
    }
  }

  private async validateProductCode(code: string): Promise<void> {
    const product = await this.db
      .select()
      .from(schema.producto)
      .where(eq(schema.producto.codigo, code))
      .limit(1);

    if (product.length > 0) {
      throw new Error('Ya existe un producto con este código');
    }
  }

  async createProduct(
    createProductDto: CreateProductoDto,
    imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    try {
      // Validate unique ID and code
      await this.validateProductId(createProductDto.id);
      if (createProductDto.codigo) {
        await this.validateProductCode(createProductDto.codigo);
      }

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

  private async productExists(id: string): Promise<boolean> {
    try {
      const product = await this.db
        .select()
        .from(schema.producto)
        .where(
          and(
            eq(schema.producto.idProducto, id),
            eq(schema.producto.estado, EntityStatus.ACTIVE), // Solo productos activos
          ),
        )
        .limit(1);

      return product.length > 0;
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        'Error al verificar existencia del producto',
        {
          cause: err,
          description: err.message,
        },
      );
    }
  }

  private async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await this.db
        .select()
        .from(schema.producto)
        .where(eq(schema.producto.idProducto, id))
        .limit(1);
      if (product.length === 0) {
        return null;
      }
      const productResponse = product.map((p) => {
        return {
          id: p.idProducto,
          nombre: p.nombre,
          codigo: p.codigo || '',
          descripcion: p.descripcion || '',
          categoria: p.categoria,
          subcategoria: p.subcategoria,
          precio: p.precio,
          costoPromedio: p.costoPromedio || '0',
          impuesto: p.impuesto,
          unidadMedida: p.unidadMedida,
          imgUrl: p.imagenUrl || '',
          publicId: p.publicImageId || '',
          estado: p.estado,
          createdAt: p.createdAt || null,
          updatedAt: p.updatedAt || null,
        };
      });

      return productResponse[0] as Product;
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al obtener el producto', {
        cause: err,
        description: err.message,
      });
    }
  }

  async updateProduct(
    id: string,
    productToUpdate: UpdateProductoDto,
    imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    try {
      const productExists = await this.productExists(id);
      if (!productExists) {
        throw new Error('El producto no existe');
      }
      const existingProduct = await this.getProductById(id);

      let imageUrl = existingProduct?.imgUrl;
      let imagePublicID = existingProduct?.publicId;

      if (imageFile) {
        // Eliminar imagen anterior si existía
        if (imagePublicID) {
          await this.fileUploadService.deleteImage(imagePublicID);
        }

        // Subir nueva imagen
        const uploadResult = await this.fileUploadService.uploadImageForEntity(
          imageFile,
          'productos',
          id,
        );
        imageUrl = uploadResult.url;
        imagePublicID = uploadResult.publicId;
      }

      // Create an update object with only the fields that are provided
      const updateData: Partial<typeof schema.producto.$inferInsert> = {};

      // Only add fields that are defined in the DTO
      if (productToUpdate.nombre !== undefined)
        updateData.nombre = productToUpdate.nombre;
      if (productToUpdate.codigo !== undefined) {
        // Validate unique code
        await this.validateProductCode(productToUpdate.codigo);
        // Update the code only if it's different from the existing one
        updateData.codigo = productToUpdate.codigo;
      }
      if (productToUpdate.descripcion !== undefined)
        updateData.descripcion = productToUpdate.descripcion;
      if (productToUpdate.categoria !== undefined)
        updateData.categoria = productToUpdate.categoria;
      if (productToUpdate.subcategoria !== undefined)
        updateData.subcategoria = productToUpdate.subcategoria;
      if (productToUpdate.precio !== undefined)
        updateData.precio = productToUpdate.precio;
      if (productToUpdate.costoPromedio !== undefined)
        updateData.costoPromedio = productToUpdate.costoPromedio;
      if (productToUpdate.impuesto !== undefined)
        updateData.impuesto = productToUpdate.impuesto;
      if (productToUpdate.unidadMedida !== undefined)
        updateData.unidadMedida = productToUpdate.unidadMedida;

      // Always update image-related fields if a new image was uploaded
      if (imageFile) {
        updateData.imagenUrl = imageUrl;
        updateData.publicImageId = imagePublicID;
      }

      const updatedProduct = await this.db
        .update(schema.producto)
        .set(updateData)
        .where(eq(schema.producto.idProducto, id))
        .returning();

      return {
        status: 'success',
        data: {
          productos: {
            id: updatedProduct[0].idProducto,
            nombre: updatedProduct[0].nombre,
            codigo: updatedProduct[0].codigo,
            descripcion: updatedProduct[0].descripcion,
            categoria: updatedProduct[0].categoria,
            subcategoria: updatedProduct[0].subcategoria,
            precio: updatedProduct[0].precio,
            costoPromedio: updatedProduct[0].costoPromedio,
            impuesto: updatedProduct[0].impuesto,
            unidadMedida: updatedProduct[0].unidadMedida,
            imgUrl: updatedProduct[0].imagenUrl || '',
            publicId: updatedProduct[0].publicImageId || '',
          },
        },
        message: 'Producto actualizado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al actualizar el producto', {
        cause: err,
        description: err.message,
      });
    }
  }

  async findProductById(id: string): Promise<ProductoResponseDto> {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        return {
          status: 'fail',
          data: { productos: null },
          message: 'Producto no encontrado',
        };
      }

      return {
        status: 'success',
        data: {
          productos: product,
        },
        message: 'Producto encontrado',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al encontrar el producto', {
        cause: err,
        description: err.message,
      });
    }
  }

  async findAllProducts(
    filterDto: FilterProductoDto,
  ): Promise<ProductoResponseDto> {
    try {
      const {
        nombre,
        codigo,
        categoria,
        subcategoria,
        page,
        size,
        sortBy,
        sortOrder,
      } = filterDto;

      // Consulta para el total primero (para validar páginas)
      const conditions: SQL[] = [];
      conditions.push(eq(schema.producto.estado, EntityStatus.ACTIVE)); // Solo productos activos
      if (nombre)
        conditions.push(
          sql`LOWER(${schema.producto.nombre}) LIKE LOWER(${`%${nombre}%`})`,
        );
      if (codigo) conditions.push(like(schema.producto.codigo, `%${codigo}%`));
      if (categoria)
        conditions.push(
          sql`LOWER(${schema.producto.categoria}) = LOWER(${categoria})`,
        );
      if (subcategoria)
        conditions.push(
          sql`LOWER(${schema.producto.subcategoria}) = LOWER(${subcategoria})`,
        );

      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.producto)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      const total = Number(totalResult[0].count);

      // Validar si hay productos
      if (total === 0) {
        return {
          status: 'success',
          data: { productos: [] },
          pagination: {
            total: 0,
            pages: 0,
            page,
            size,
          },
          message: 'No se encontraron productos con los filtros especificados',
        };
      }

      // Validar página solicitada
      const totalPages = Math.ceil(total / size);
      if (page > totalPages) {
        return {
          status: 'fail',
          data: { productos: [] },
          pagination: {
            total,
            pages: totalPages,
            page,
            size,
          },
          message: `La página solicitada ${page} excede el total de páginas disponibles (${totalPages})`,
        };
      }

      // Construir ORDER BY
      let orderBy: SQL;
      if (sortBy && sortBy in schema.producto) {
        const column = schema.producto[sortBy as keyof typeof schema.producto];
        if (column) {
          orderBy =
            sortOrder === 'desc' ? sql`${column} DESC` : sql`${column} ASC`;
        } else {
          orderBy = sql`${schema.producto.createdAt} DESC`;
        }
      } else {
        orderBy = sql`${schema.producto.createdAt} DESC`;
      }

      // Consulta principal con paginación
      const products = await this.db
        .select()
        .from(schema.producto)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(size)
        .offset((page - 1) * size);

      // Mapear resultados
      const mappedProducts = products.map((p) => ({
        id: p.idProducto,
        nombre: p.nombre,
        codigo: p.codigo || '',
        descripcion: p.descripcion || '',
        categoria: p.categoria,
        subcategoria: p.subcategoria,
        precio: p.precio,
        costoPromedio: p.costoPromedio || '0',
        impuesto: p.impuesto,
        unidadMedida: p.unidadMedida,
        imgUrl: p.imagenUrl || '',
        publicId: p.publicImageId || '',
        estado: p.estado,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      return {
        status: 'success',
        data: { productos: mappedProducts },
        pagination: {
          total,
          pages: totalPages,
          page,
          size,
        },
        message: `Se encontraron ${total} productos`,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al buscar productos', {
        cause: err,
        description: err.message,
      });
    }
  }

  async deleteProduct(id: string): Promise<ProductoResponseDto> {
    //Desactivar el producto
    try {
      const productExists = await this.productExists(id);
      if (!productExists) {
        throw new Error('El producto no existe');
      }

      // Eliminar el producto de la base de datos
      await this.db
        .update(schema.producto)
        .set({ estado: EntityStatus.INACTIVE })
        .where(eq(schema.producto.idProducto, id));

      return {
        status: 'success',
        data: { productos: null },
        message: 'Producto eliminado correctamente',
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al eliminar el producto', {
        cause: err,
        description: err.message,
      });
    }
  }

  async getAllCategories(): Promise<CategoriasResponseDto> {
    try {
      // Get distinct categories and subcategories separately
      const categories = await this.db
        .selectDistinct({ category: schema.producto.categoria })
        .from(schema.producto)
        .where(eq(schema.producto.estado, EntityStatus.ACTIVE))
        .orderBy(asc(schema.producto.categoria));

      const subcategories = await this.db
        .selectDistinct({ subcategory: schema.producto.subcategoria })
        .from(schema.producto)
        .where(eq(schema.producto.estado, EntityStatus.ACTIVE))
        .orderBy(asc(schema.producto.subcategoria));

      return {
        status: 'success',
        data: {
          categorias: categories.map((c) => c.category || ''),
          subcategorias: subcategories.map((s) => s.subcategory || ''),
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException('Error al obtener las categorias', {
        cause: err,
        description: err.message,
      });
    }
  }
}
