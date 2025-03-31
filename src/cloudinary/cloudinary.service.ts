// src/cloudinary/cloudinary.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { CloudinaryResponse } from './dto';
import * as streamifier from 'streamifier';
import { CloudinaryProvider } from './cloudinary/cloudinary';

export interface UploadOptions {
  folder: string;
  transformation?: Record<string, any>;
}

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CloudinaryProvider) private readonly cloudinary: typeof v2,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<CloudinaryResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          ...options,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(
                'Error al subir el archivo: ' + error.message,
              ),
            );
          }
          if (!result) {
            return reject(
              new BadRequestException(
                'No se pudo obtener el resultado de la subida',
              ),
            );
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    entity: string,
    entityId?: string,
  ): Promise<CloudinaryResponse> {
    console.log('Starting uploadImage process...');
    console.log('File received:', {
      filename: file?.originalname,
      size: file?.size,
      mimetype: file?.mimetype,
    });

    if (!file) {
      console.log('Error: No file provided');
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      console.log('Error: Invalid file type:', file.mimetype);
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('Error: File too large:', file.size);
      throw new BadRequestException('El archivo no debe superar los 5MB');
    }

    if (!entity) {
      console.log('Error: No entity specified');
      throw new BadRequestException('Se requiere especificar una entidad');
    }

    const folderPath = this.getFolderPath(entity, entityId);
    console.log('Upload folder path:', folderPath);

    const result = await this.uploadFile(file, { folder: folderPath });
    console.log('Upload completed successfully');
    return result;
  }

  async deleteFile(publicId: string): Promise<CloudinaryResponse> {
    if (!publicId) {
      throw new BadRequestException(
        'Se requiere un ID público para eliminar el archivo',
      );
    }

    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new BadRequestException('No se pudo eliminar el archivo');
      }
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        'Error al eliminar el archivo: ' + errorMessage,
      );
    }
  }

  private getFolderPath(entity: string, entityId?: string): string {
    const baseFolder = 'nest-app'; // Carpeta raíz en Cloudinary
    let entityFolder = entity;

    // Transformar a formato válido para paths (ej: "productos")
    entityFolder = entityFolder.toLowerCase().replace(/\s+/g, '-');

    if (entityId) {
      return `${baseFolder}/${entityFolder}/${entityId}`;
    }
    return `${baseFolder}/${entityFolder}`;
  }
}
