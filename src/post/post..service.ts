import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CloudinaryService } from '../common/cloudinary.service';
import { User } from '@prisma/client';
import { PostResponse } from '../model/post.model';

@Injectable()
export class PostService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getPostsCurrent(user: User): Promise<PostResponse[]> {
    const result = await this.prismaService.post.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    return result.map((post) => ({
      id: post.id,
      userId: post.userId,
      name: post.user.name,
      slug: post.slug,
      image: post.image,
      description: post.description,
      createdAt: post.createdAt,
    }));
  }
}
