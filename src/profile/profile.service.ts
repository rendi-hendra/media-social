import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProfileResponse } from '../model/profile.model';
import { User } from '@prisma/client';
import { ErrorMessage } from '../enum/error.enum';

@Injectable()
export class ProfileService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private async findUser(userId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async getProfile(userId: number): Promise<ProfileResponse> {
    this.logger.debug(`Get profile ${JSON.stringify(userId)}`);

    const user = await this.findUser(userId);

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: number,
    file: Express.Multer.File,
  ): Promise<ProfileResponse> {
    this.logger.debug(`Update profile ${JSON.stringify(file)}`);

    const user = await this.findUser(userId);

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

  async deleteProfile(userId: number): Promise<ProfileResponse> {
    this.logger.debug(`Delete profile ${JSON.stringify(userId)}`);

    const user = await this.findUser(userId);

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
