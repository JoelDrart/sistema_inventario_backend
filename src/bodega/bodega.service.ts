import { Injectable } from '@nestjs/common';
import { BodegaRepository } from './bodega.repository';
import { PagePaginationDto } from '../dto';
import { BodegaResponseDto, CreateBodegaDto } from './dto';

@Injectable()
export class BodegaService {
  constructor(private bodegaRepository: BodegaRepository) {}

  create(CreateBodegaDto: CreateBodegaDto): Promise<BodegaResponseDto> {
    return this.bodegaRepository.createBodega(CreateBodegaDto);
  }
  findAll(query: PagePaginationDto): Promise<BodegaResponseDto> {
    return this.bodegaRepository.findAllActiveBodegas(query);
  }
}
