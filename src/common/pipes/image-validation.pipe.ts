// src/common/pipes/image-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageValidationPipe implements PipeTransform<Express.Multer.File> {
  private readonly validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ] as const;
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  async transform(
    file: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    try {
      await this.validateFile(file);
      return file;
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(err.message);
    }
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    if (!this.isValidMimeType(file.mimetype)) {
      throw new Error(
        `Formato de imagen no válido. Formatos permitidos: ${this.validMimeTypes.join(', ')}`,
      );
    }

    if (!this.isValidSize(file.size)) {
      throw new Error(
        `La imagen no puede superar los ${this.formatSize(this.maxSize)}`,
      );
    }
  }

  private isValidMimeType(mimetype: string): boolean {
    return this.validMimeTypes.includes(
      mimetype as (typeof this.validMimeTypes)[number],
    );
  }

  private isValidSize(size: number): boolean {
    return size <= this.maxSize;
  }

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb}MB`;
  }
}
