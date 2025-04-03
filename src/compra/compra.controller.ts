import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CompraService } from './compra.service';
import { EmpleadoInterceptor } from 'src/common/interceptors/empleado.interceptor';
import { CreateCompraDto } from './dto';

@Controller('compra')
@UseInterceptors(EmpleadoInterceptor)
export class CompraController {
  constructor(private readonly compraService: CompraService) {}
  @Post('')
  create(@Body() createCompraDto: CreateCompraDto) {
    // console.log('DTO recibido:', {
    //   ...createCompraDto,
    //   detalles: createCompraDto.detalles?.slice(0, 2),
    // });

    return this.compraService.createCompra(createCompraDto);
  }
}
