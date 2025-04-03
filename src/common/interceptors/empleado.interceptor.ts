import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from 'src/auth/entities/auth.entity';

@Injectable()
export class EmpleadoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.body && request.user?.id) {
      (request.body as any).id_Empleado = request.user.id; // Usamos directamente request.user.id
    }

    return next.handle();
  }
}
