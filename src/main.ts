import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        // console.log('Validation Errors:', JSON.stringify(errors, null, 2));

        // Modificación para incluir los nombres de los campos
        const validationErrors = errors.reduce(
          (acc: { field: string; messages: string[] }[], error) => {
            if (error.constraints) {
              const errorMessages = Object.values(error.constraints);
              acc.push({
                field: error.property,
                messages: errorMessages,
              });
            }
            return acc;
          },
          [],
        );

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
