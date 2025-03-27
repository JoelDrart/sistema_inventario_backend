/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSucursalDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(100, {
    message: 'La dirección no debe exceder los 100 caracteres',
  })
  direccion: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'El teléfono debe ser un número válido',
  })
  telefono: string;
}
