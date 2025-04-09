import { Body, Controller, Post } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto';

@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  create(@Body() createFactura: CreateFacturaDto) {
    return createFactura;
  }
}
