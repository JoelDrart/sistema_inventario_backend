import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationMeta {
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class PagePaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El número de página debe ser mayor o igual a 1' })
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El tamaño de página debe ser mayor o igual a 1' })
  @Max(100, { message: 'El tamaño de página no debe exceder 100' })
  @Type(() => Number)
  size: number = 10;
}
