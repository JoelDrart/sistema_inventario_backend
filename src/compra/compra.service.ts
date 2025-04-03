import { Injectable } from '@nestjs/common';
import { CompraRepository } from './compra.repository';
import { CreateCompraDto } from './dto';

@Injectable()
export class CompraService {
  constructor(private compraRepo: CompraRepository) {}

  createCompra(createCompra: CreateCompraDto) {
    //TODO: Validar que el id de la bodega, el del producto y el id del proveedor existan en la base de datos

    return this.compraRepo.createCompra(createCompra);
  }

  //TODO: Actualizar una compra

  //TODO: Anular una compra (hacer toda la lógica de stock y de ordenes de compra)

  //TODO: Obtener detalle de una compra por id

  //TODO: Obtener todas las compras con filtros (por fecha, por proveedor, por empleado, por estado, ...)
}
