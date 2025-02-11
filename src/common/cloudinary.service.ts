import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminAndResourceOptions,
  v2 as cloudinary,
  ResourceApiResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

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
    file: Express.Multer.File,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) {
            reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${err.message}`,
              ),
            );
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(file.buffer); // Mengirim file ke Cloudinary
    });
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

  async getResources(
    publicId: string[],
    option?: AdminAndResourceOptions,
  ): Promise<ResourceApiResponse> {
    try {
      return await cloudinary.api.resources_by_ids(publicId, option);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteResources(
    publicId: string[],
    option?: AdminAndResourceOptions,
  ): Promise<ResourceApiResponse> {
    try {
      return await cloudinary.api.delete_resources(publicId, option);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
