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
import { SucursalService } from './sucursal.service';
import { CreateSucursalDto, SucursalIdDto, UpdateSucursalDto } from './dto';
import { PagePaginationDto, Role } from '../dto';
import { Roles } from '../auth/decorators/rol.decorator';

@Controller('sucursal')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalService.create(createSucursalDto);
  }

  @Get()
  findAll(@Query() query: PagePaginationDto) {
    return this.sucursalService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: SucursalIdDto) {
    return this.sucursalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param() { id }: SucursalIdDto,
    @Body() updateSucursalDto: UpdateSucursalDto,
  ) {
    return this.sucursalService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  remove(@Param() { id }: SucursalIdDto) {
    return this.sucursalService.remove(id);
  }
}
