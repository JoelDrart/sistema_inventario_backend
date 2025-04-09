import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  HttpException,
  HttpStatus,
  ValidationError,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      stopAtFirstError: true, // Cambiado a false para ver todos los errores
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: ValidationError[]) => {
        interface ValidationErrorResponse {
          field: string;
          messages: string[];
        }

        const formatErrors = (
          errors: ValidationError[],
          parentProperty = '',
        ): ValidationErrorResponse[] => {
          return errors.flatMap((error) => {
            const property = parentProperty
              ? `${parentProperty}[${error.property}] `
              : error.property;

            // Manejar errores con constraints
            if (error.constraints) {
              return {
                field: property,
                messages: Object.values(error.constraints),
              };
            }

            // Manejar arrays/objetos anidados
            if (error.children && error.children.length > 0) {
              return formatErrors(error.children, property);
            }

            return [];
          });
        };

        const validationErrors = formatErrors(errors);

        throw new HttpException(
          {
            status: 'fail',
            data: validationErrors,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
