import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CompraService } from './compra.service';
import { EmpleadoInterceptor } from 'src/common/interceptors/empleado.interceptor';
import { CreateCompraDto, FilterCompraDto, UpdateCompraDto } from './dto';

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

  @Get('')
  findAll(@Query() filter: FilterCompraDto) {
    return this.compraService.getCompras(filter);
  }
  @Get(':idCompra')
  findOne(@Param('idCompra') id: string) {
    return this.compraService.getCompraById(id);
  }

  @Patch(':idCompra')
  update(
    @Param('idCompra') id: string,
    @Body() updateCompraDto: UpdateCompraDto,
  ) {
    return this.compraService.updateCompra(id, updateCompraDto);
  }

  @Delete(':idCompra')
  delete(@Param('idCompra') id: string) {
    return this.compraService.cancelCompra(id);
  }
}
