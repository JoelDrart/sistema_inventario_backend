import { Module } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { BodegaRepository } from './bodega.repository';

@Module({
  controllers: [BodegaController],
  providers: [BodegaService, BodegaRepository],
})
export class BodegaModule {}
