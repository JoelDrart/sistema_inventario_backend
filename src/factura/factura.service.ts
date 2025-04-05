import { Injectable } from '@nestjs/common';
import { FacturaRepository } from './factura.repository';

@Injectable()
export class FacturaService {
  constructor(private readonly facturaRepo: FacturaRepository) {}
}
