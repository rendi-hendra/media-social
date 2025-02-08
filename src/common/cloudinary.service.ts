import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

type TypeFolder = 'profil' | 'post';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    filePath: string,
    nameFolder: TypeFolder,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: nameFolder,
      });
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error}`);
    }
  }

  getOptimizedImageUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  getCroppedImageUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      crop: 'auto',
      gravity: 'auto',
      width: 500,
      height: 500,
    });
  }
}
