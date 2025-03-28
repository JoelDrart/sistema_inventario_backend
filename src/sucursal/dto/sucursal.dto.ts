import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Sucursal } from '../entities';

export class CreateSucursalDto {
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(100, {
    message: 'La dirección no debe exceder los 100 caracteres',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  direccion: string;

  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'El teléfono debe ser un número válido',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  telefono: string;
}

export class CreateSucursalResponseDto {
  status: string;
  data: Sucursal;
}
