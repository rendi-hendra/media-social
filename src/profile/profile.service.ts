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
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    };
  }
}
