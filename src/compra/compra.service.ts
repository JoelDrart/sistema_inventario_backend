import { Injectable } from '@nestjs/common';
import { CompraRepository } from './compra.repository';
import { CreateCompraDto } from './dto';

@Injectable()
export class CompraService {
  constructor(private compraRepo: CompraRepository) {}

  createCompra(createCompra: CreateCompraDto) {
    {
      return this.compraRepo.createCompra(createCompra);
    }
  }
}
