import { Injectable } from '@nestjs/common';
import { ClienteRepository } from './cliente.repository';
import {
  ClienteResponseDto,
  CreateClienteDto,
  FilterClienteDto,
  UpdateClienteDto,
} from './dto';

@Injectable()
export class ClienteService {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  create(createCliente: CreateClienteDto): Promise<ClienteResponseDto> {
    return this.clienteRepository.create(createCliente);
  }

  update(
    id: string,
    updateCliente: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    return this.clienteRepository.updateCliente(id, updateCliente);
  }

  findOne(id: string): Promise<ClienteResponseDto> {
    return this.clienteRepository.findClienteById(id);
  }

  findAll(filterDto: FilterClienteDto): Promise<ClienteResponseDto> {
    return this.clienteRepository.findAllClientes(filterDto);
  }
}
