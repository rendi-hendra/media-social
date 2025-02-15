import { Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProfileResponse } from '../model/profile.model';
import { User } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getProfile(user: User): Promise<ProfileResponse> {
    this.logger.debug(`Get profile ${JSON.stringify(user)}`);

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    user: User,
    file: Express.Multer.File,
  ): Promise<ProfileResponse> {
    this.logger.debug(`Update profile ${JSON.stringify(user)}`);

    const profile = await this.cloudinaryService.uploadImage(file, {
      folder: 'profile',
      resource_type: 'image',
      public_id: `${user.name}${user.id}`,
      transformation: 'profile',
    });

    const updateProfile = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        image: profile.url,
      },
    });

    return {
      id: updateProfile.id,
      username: updateProfile.username,
      name: updateProfile.name,
      image: updateProfile.image,
      createdAt: updateProfile.createdAt,
    };
  }

  async deleteProfile(user: User): Promise<ProfileResponse> {
    this.logger.debug(`Delete profile ${JSON.stringify(user)}`);

    await this.cloudinaryService.deleteResources([
      `profile/${user.name}${user.id}`,
    ]);

    const getProfile = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    this.logger.debug(`Get profile ${JSON.stringify(getProfile.resources[0])}`);

    const updateProfile = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        image: getProfile.resources[0].url,
      },
    });

    return {
      id: updateProfile.id,
      username: updateProfile.username,
      name: updateProfile.name,
      image: updateProfile.image,
      createdAt: updateProfile.createdAt,
    };
  }
}
