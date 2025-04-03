import { BadRequestException, Injectable } from '@nestjs/common';
import { CompraRepository } from './compra.repository';
import {
  CompraResponseDto,
  CompraResponseFormattedDto,
  CreateCompraDto,
  FilterCompraDto,
  UpdateCompraDto,
} from './dto';

@Injectable()
export class CompraService {
  constructor(private compraRepo: CompraRepository) {}

  getCompras(filter: FilterCompraDto): CompraResponseFormattedDto {
    try {
      const { page, size } = filter;

      const offset = (page - 1) * size;
      console.log('Filter recibido:', filter);
      // const compras = await this.compraRepo.getCompras(filter);
      return {
        status: 'success',
        message: 'Compras obtenidas correctamente',
        data: { compras: null },
      };
    } catch (error: unknown) {
      console.error('Error al obtener las compras:', error);
      const err = error as Error;
      throw new BadRequestException('Error al obtener las compras', {
        cause: err,
        description: err.message,
      });
    }
  }

  async getCompraById(id: string): Promise<CompraResponseFormattedDto> {
    try {
      // Validar que el id de la compra exista
      await this.validateCompraOrNumeroFactura(id);

      const compra = await this.compraRepo.getCompraById(id);
      if (!compra) {
        return {
          status: 'error',
          message: 'Compra no encontrada',
          data: { compras: null },
        };
      }
      return {
        status: 'success',
        message: 'Compra obtenida correctamente',
        data: { compras: compra },
      };
    } catch (error: unknown) {
      console.error('Error al obtener la compra:', error);
      const err = error as Error;
      throw new BadRequestException('Error al obtener la compra', {
        cause: err,
        description: err.message,
      });
    }
  }

  // async getCompras(): Promise<CompraResponseDto> {
  //   try {
  //     const compras = await this.compraRepo.getCompras();
  //     return {
  //       status: 'success',
  //       message: 'Compras obtenidas correctamente',
  //       data: { compras },
  //     };
  //   } catch (error: unknown) {
  //     console.error('Error al obtener las compras:', error);
  //     const err = error as Error;
  //     throw new BadRequestException('Error al obtener las compras', {
  //       cause: err,
  //       description: err.message,
  //     });
  //   }
  // }

  async validateIdProveedor(idProveedor: string) {
    const exists = await this.compraRepo.validateProveedor(idProveedor);
    if (!exists) {
      throw new Error(`El id del proveedor '${idProveedor}' no existe`);
    }
  }

  async validateProductBodega(idProducto: string, idBodega: string) {
    const exists = await this.compraRepo.validateProductoBodega(
      idProducto,
      idBodega,
    );
    if (!exists) {
      throw new Error(
        `El id del producto '${idProducto}' o de la bodega '${idBodega}' no existe`,
      );
    }
  }
  async validateCompra(idCompra: string) {
    const exists = await this.compraRepo.validateCompra(idCompra);
    if (!exists) {
      throw new Error(`El id de la compra '${idCompra}' no existe`);
    }
  }

  async validateCompraOrNumeroFactura(id: string) {
    const exists = await this.compraRepo.validateCompraOrNumeroFactura(id);
    if (!exists) {
      throw new Error(`El id de la compra '${id}' no existe`);
    }
  }

  async validateAll(compra: CreateCompraDto) {
    await this.validateIdProveedor(compra.idProveedor);
    for (const detalle of compra.detalles) {
      await this.validateProductBodega(detalle.idProducto, detalle.idBodega);
    }
  }

  async createCompra(
    createCompra: CreateCompraDto,
  ): Promise<CompraResponseDto> {
    try {
      // Validar que el id del proveedor exista
      // await this.validateIdProveedor(createCompra.idProveedor);

      // Validar que el id del producto y bodega existan para cada detalle
      // for (const detalle of createCompra.detalles) {
      //   await this.validateProductBodega(detalle.idProducto, detalle.idBodega);
      // }

      // Validar que el id de la compra no exista
      if (createCompra.idCompra) {
        await this.validateCompra(createCompra.idCompra);
      }

      await this.validateAll(createCompra);

      //TODO: Validar que el total sea correcto (suma de los detalles = cantidad * costoUnitario)
      const newCompra = await this.compraRepo.createCompra(createCompra);
      return {
        status: 'success',
        message: 'Compra creada correctamente',
        data: { compras: newCompra },
      };
    } catch (error: unknown) {
      console.error('Error al crear la compra:', error);
      const err = error as Error;
      throw new BadRequestException('Error al crear la compra', {
        cause: err,
        description: err.message,
      });
    }
  }

  //TODO: Actualizar una compra

  async updateCompra(
    idCompra: string,
    updateCompra: UpdateCompraDto,
  ): Promise<CompraResponseDto> {
    try {
      // Validar que el id de la compra exista
      await this.validateCompra(idCompra);

      // Validar que el id del proveedor exista
      if (updateCompra.idProveedor) {
        await this.validateIdProveedor(updateCompra.idProveedor);
      }

      // Validar que el id del producto y bodega existan para cada detalle
      if (updateCompra.detalles) {
        for (const detalle of updateCompra.detalles) {
          await this.validateProductBodega(
            detalle.idProducto,
            detalle.idBodega,
          );
        }
      }
      const updatedCompra = await this.compraRepo.updateCompra(
        idCompra,
        updateCompra,
      );

      return {
        status: 'success',
        message: 'Compra actualizada correctamente',
        data: { compras: updatedCompra },
      };
    } catch (error: unknown) {
      console.error('Error al actualizar la compra:', error);
      const err = error as Error;
      throw new BadRequestException('Error al actualizar la compra', {
        cause: err,
        description: err.message,
      });
    }
  }

  //TODO: Anular una compra (hacer toda la lógica de stock y de ordenes de compra)
  async cancelCompra(idCompra: string): Promise<CompraResponseDto> {
    try {
      // Validar que el id de la compra exista
      await this.validateCompra(idCompra);

      await this.compraRepo.anularCompra(idCompra);

      return {
        status: 'success',
        message: 'Compra cancelada correctamente',
        data: { compras: null },
      };
    } catch (error: unknown) {
      console.error('Error al cancelar la compra:', error);
      const err = error as Error;
      throw new BadRequestException('Error al cancelar la compra', {
        cause: err,
        description: err.message,
      });
    }
  }

  //TODO: Obtener detalle de una compra por id

  //TODO: Obtener todas las compras con filtros (por fecha, por proveedor, por empleado, por estado, ...)
}
