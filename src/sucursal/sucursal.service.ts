import { Injectable } from '@nestjs/common';
import { CreateSucursalDto } from './dto/sucursal.dto';
// import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { SucursalRepository } from './sucursal.repository';

@Injectable()
export class SucursalService {
  constructor(private sucursalRepository: SucursalRepository) {}
  create(createSucursalDto: CreateSucursalDto) {
    return this.sucursalRepository.createSucursal(createSucursalDto);
  }

  findAll() {
    return `This action returns all sucursal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sucursal`;
  }

  // update(id: number, updateSucursalDto: UpdateSucursalDto) {
  //   return `This action updates a #${id} sucursal`;
  // }

  remove(id: number) {
    return `This action removes a #${id} sucursal`;
  }
}
