import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto, ProveedorIdDto, UpdateProveedorDto } from './dto';
import { PagePaginationDto } from '../dto';

@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  findAll(@Query() query: PagePaginationDto) {
    return this.proveedorService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: ProveedorIdDto) {
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param() { id }: ProveedorIdDto,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  remove(@Param() { id }: ProveedorIdDto) {
    return this.proveedorService.remove(id);
  }
}
