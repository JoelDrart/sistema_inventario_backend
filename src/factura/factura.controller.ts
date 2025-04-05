import { Controller } from '@nestjs/common';
import { FacturaService } from './factura.service';

@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}
}
