import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export type UploadImageResponse = {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

@Injectable()
export class FileUploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImageForEntity(
    file: Express.Multer.File,
    entity: string,
    entityId?: string,
  ): Promise<UploadImageResponse> {
    try {
      const result = await this.cloudinaryService.uploadImage(
        file,
        entity,
        entityId,
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(
        `Error al subir la imagen para ${entity}: ${err.message}`,
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFile(publicId);
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(`Error al eliminar la imagen: ${err.message}`);
    }
  }
}
