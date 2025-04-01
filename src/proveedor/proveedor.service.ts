import { Injectable } from '@nestjs/common';
import {
  CreateProveedorDto,
  ProveedorResponseDto,
  UpdateProveedorDto,
} from './dto';
import { ProveedorRepository } from './proveedor.repository';
import { PagePaginationDto } from '../dto';

@Injectable()
export class ProveedorService {
  constructor(private proveedorRepository: ProveedorRepository) {}
  create(
    createProveedorDto: CreateProveedorDto,
  ): Promise<ProveedorResponseDto> {
    return this.proveedorRepository.createProveedor(createProveedorDto);
  }

  findAll(query: PagePaginationDto): Promise<ProveedorResponseDto> {
    return this.proveedorRepository.findAllProveedores(query);
  }

  findOne(id: string): Promise<ProveedorResponseDto> {
    return this.proveedorRepository.findProveedorById(id);
  }

  update(id: string, updateProveedorDto: UpdateProveedorDto) {
    return this.proveedorRepository.updateProveedor(id, updateProveedorDto);
  }

  remove(id: string) {
    return `This action removes a #${id} proveedor`;
  }
}
