import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import {
  ClienteIdDto,
  ClienteResponseDto,
  CreateClienteDto,
  FilterClienteDto,
  UpdateClienteDto,
} from './dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  create(@Body() createCliente: CreateClienteDto) {
    return this.clienteService.create(createCliente);
  }

  @Patch(':id')
  update(
    @Param() { id }: ClienteIdDto,
    @Body() updateCliente: UpdateClienteDto,
  ) {
    return this.clienteService.update(id, updateCliente);
  }

  @Get()
  findAll(@Query() filterDto: FilterClienteDto): Promise<ClienteResponseDto> {
    return this.clienteService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param() { id }: ClienteIdDto) {
    return this.clienteService.findOne(id);
  }

  @Delete(':id')
  delete(@Param() { id }: ClienteIdDto) {
    return this.clienteService.delete(id);
  }
}
