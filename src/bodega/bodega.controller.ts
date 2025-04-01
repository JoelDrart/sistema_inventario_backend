import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { PagePaginationDto, Role } from '../dto';
import { Roles } from '../auth/decorators/rol.decorator';
import { CreateBodegaDto } from './dto';

@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Post()
  // @Roles(Role.ADMIN)
  create(@Body() createBodegaDto: CreateBodegaDto) {
    return this.bodegaService.create(createBodegaDto);
  }

  @Get()
  findAll(@Query() query: PagePaginationDto) {
    return this.bodegaService.findAll(query);
  }

  //TODO: findone, update, remove(deactivate) methods
}
