import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req; // 🔹 Usa req.originalUrl en lugar de req.url
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${method}] ${originalUrl} - ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  }
}
