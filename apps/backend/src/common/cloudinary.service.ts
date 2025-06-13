import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'profile-photos',
    publicId?: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!file.buffer) {
        throw new Error('File buffer is undefined');
      }

      // Verificar que las variables de entorno estén configuradas
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
      }

      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        resource_type: 'image',
        folder: `myhometech/${folder}`,
        public_id: publicId,
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', format: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Error uploading image to Cloudinary: ${error.message || error}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Error deleting image from Cloudinary: ${error.message}`);
      // No lanzamos error para que no falle la operación principal
    }
  }

  generateOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }): string {
    const { width = 200, height = 200, quality = 'auto', format = 'auto' } = options || {};
    
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'face',
      quality,
      format,
      secure: true
    });
  }
}