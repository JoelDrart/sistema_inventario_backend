import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db/index';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { User } from './entity/user.entity';
import { RegisterAuthDto } from '../auth/dto';
import { generateUserId, hashPassword } from './utils';
import { UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async userExists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select({ email: schema.empleado.email })
      .from(schema.empleado)
      .where(eq(schema.empleado.email, email));

    return !!user;
  }

  async createUser(user: RegisterAuthDto): Promise<User | null> {
    try {
      const userExists = await this.userExists(user.email);
      if (userExists) {
        throw new Error('El usuario ya existe. Llame a soporte.');
      }

      const id = generateUserId();
      const hashedPassword = await hashPassword(user.password);

      const newUser = {
        ...user,
        idEmpleado: id,
        password: hashedPassword,
      };

      const [registeredUser] = await this.db
        .insert(schema.empleado)
        .values({
          idEmpleado: newUser.idEmpleado,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          documentoIdentidad: newUser.dni,
          email: newUser.email,
          passwordHash: newUser.password,
          rol: newUser.rol ?? 'cliente',
        })
        .returning({
          idEmpleado: schema.empleado.idEmpleado,
          email: schema.empleado.email,
          nombre: schema.empleado.nombre,
          apellido: schema.empleado.apellido,
          documentoIdentidad: schema.empleado.documentoIdentidad,
          rol: schema.empleado.rol,
          estado: schema.empleado.estado,
        });

      return {
        id: registeredUser.idEmpleado,
        email: registeredUser.email,
        name: registeredUser.nombre,
        apellido: registeredUser.apellido,
        dni: registeredUser.documentoIdentidad,
        rol: registeredUser.rol ?? '',
        estado: registeredUser.estado ?? '',
      };
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw new InternalServerErrorException('Error al registrar el usuario', {
        cause: error,
        description: 'No se pudo registrar el usuario en la base de datos',
      });
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const [user] = await this.db
        .select({
          id: schema.empleado.idEmpleado,
          email: schema.empleado.email,
          dni: schema.empleado.documentoIdentidad,
          rol: schema.empleado.rol,
          state: schema.empleado.estado,
          firstName: schema.empleado.nombre,
          lastName: schema.empleado.apellido,
          hashPassword: schema.empleado.passwordHash,
        })
        .from(schema.empleado)
        .where(eq(schema.empleado.email, email));

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.firstName,
        apellido: user.lastName,
        dni: user.dni,
        rol: user.rol ?? '',
        estado: user.state ?? '',
        password: user.hashPassword ?? '',
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new InternalServerErrorException(
        'No pudimos encontrar su usuario',
        {
          cause: error,
          description: 'No se pudo obtener el usuario de la BD.',
        },
      );
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      const [user] = await this.db
        .select({
          id: schema.empleado.idEmpleado,
          email: schema.empleado.email,
          dni: schema.empleado.documentoIdentidad,
          rol: schema.empleado.rol,
          state: schema.empleado.estado,
          firstName: schema.empleado.nombre,
          lastName: schema.empleado.apellido,
        })
        .from(schema.empleado)
        .where(eq(schema.empleado.idEmpleado, id));

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.firstName,
        apellido: user.lastName,
        dni: user.dni,
        rol: user.rol ?? '',
        estado: user.state ?? '',
      };
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new InternalServerErrorException(
        'No pudimos encontrar su usuario',
        {
          cause: error,
          description: 'No se pudo obtener el usuario de la BD.',
        },
      );
    }
  }

  async assignSucursalToUser(
    userId: string,
    sucursalId: string,
  ): Promise<UserResponseDto | null> {
    try {
      // Validate if sucursal exists
      const [sucursal] = await this.db
        .select()
        .from(schema.sucursal)
        .where(eq(schema.sucursal.idSucursal, sucursalId.toLowerCase()));

      if (!sucursal) {
        throw new Error('La sucursal especificada no existe');
      }

      // Validate if user already has this sucursal
      const [currentUser] = await this.db
        .select({ idSucursal: schema.empleado.idSucursal })
        .from(schema.empleado)
        .where(eq(schema.empleado.idEmpleado, userId));

      if (currentUser?.idSucursal === sucursalId.toLowerCase()) {
        throw new Error('El usuario ya está asignado a esta sucursal');
      }

      const [user] = await this.db
        .update(schema.empleado)
        .set({ idSucursal: sucursalId.toLowerCase() })
        .where(eq(schema.empleado.idEmpleado, userId))
        .returning({
          idEmpleado: schema.empleado.idEmpleado,
          email: schema.empleado.email,
          nombre: schema.empleado.nombre,
          apellido: schema.empleado.apellido,
          documentoIdentidad: schema.empleado.documentoIdentidad,
          rol: schema.empleado.rol,
          estado: schema.empleado.estado,
          idSucursalS: schema.empleado.idSucursal,
        });

      if (!user) {
        return null;
      }

      return {
        status: 'success',
        data: {
          id: user.idEmpleado,
          email: user.email,
          name: user.nombre,
          apellido: user.apellido,
          dni: user.documentoIdentidad,
          rol: user.rol ?? '',
          idSucursal: user.idSucursalS ?? sucursalId,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error assigning sucursal to user:', error);
      throw new InternalServerErrorException(
        'No pudimos asignar la sucursal al usuario',
        {
          cause: error,
          description: err.message,
        },
      );
    }
  }
}
