import { Injectable } from '@nestjs/common';
import { CreateSucursalDto, UpdateSucursalDto } from './dto/sucursal.dto';
import { SucursalRepository } from './sucursal.repository';
import { PagePaginationDto } from '../dto';

@Injectable()
export class SucursalService {
  constructor(private sucursalRepository: SucursalRepository) {}
  create(createSucursalDto: CreateSucursalDto) {
    return this.sucursalRepository.createSucursal(createSucursalDto);
  }

  findAll(query: PagePaginationDto) {
    return this.sucursalRepository.findAllActiveSucursales(query);
  }

  findOne(id: string) {
    return this.sucursalRepository.findOneSucursal(id);
  }

  update(id: string, updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalRepository.updateSucursal(id, updateSucursalDto);
  }

  remove(id: string) {
    return this.sucursalRepository.deactivateSucursal(id);
  }
}
