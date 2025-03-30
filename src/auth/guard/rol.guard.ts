import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../entities/auth.entity';
import { ROLES_KEY } from '../decorators/rol.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      console.log('No hay roles requeridos para esta ruta');
      return true; // Si no hay roles requeridos, permitir acceso
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.rol) {
      console.log('Usuario no tiene rol asignado');
      throw new ForbiddenException('Usuario no tiene roles asignados');
    }

    const hasRole = requiredRoles.some((role) => user.rol === role);

    if (!hasRole) {
      console.log('Usuario no tiene el rol(es) requerido');
      throw new ForbiddenException(
        'No tiene permiso para acceder a este recurso',
      );
    }

    return true;
  }
}
