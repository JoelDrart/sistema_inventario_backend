import { IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PaginationMeta } from 'src/dto';

export class StockProductoBodegaDto {
  @IsString({ message: 'El ID del producto debe ser un string' })
  @IsNotEmpty({ message: 'El id del producto es requerido' })
  idProducto: string;

  @IsString({ message: 'El ID de bodega debe ser una cadena de texto' })
  @Matches(/^bod\d{3}$/, {
    message:
      'El ID de bodega debe tener el formato "bod" seguido de 3 dígitos (ej. bod001)',
  })
  @IsNotEmpty({ message: 'El ID de bodega es requerido' })
  idBodega: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  cantidad: number = 0;
}

export class StockProductoBodegaResponseDto {
  status: string;
  data: { stock: StockProductoBodegaDto | null | StockProductoBodegaDto[] };
  pagination?: PaginationMeta | null;
  message?: string;
}
