import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch()
export class RolesExceptionFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.getStatus() === 403) {
      response.status(403).json({
        status: 'error',
        message: 'Acceso denegado: no tienes los permisos necesarios',
        error: 'Forbidden',
      });
    } else {
      super.catch(exception, host);
    }
  }
}
