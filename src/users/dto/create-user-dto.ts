/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  Min,
  Length,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Min(3)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Min(3)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 13)
  documentoIdentidad: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Min(4)
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'employee', 'client'])
  rol: string;

  @IsString()
  @IsNotEmpty()
  idSucursal: string;

  @IsDateString()
  @IsNotEmpty()
  fechaContratacion: string;
}
