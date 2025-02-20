import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CloudinaryService } from '../common/cloudinary.service';
import { User } from '@prisma/client';
import { CreatePostRequest, PostResponse } from '../model/post.model';
import { PostValidation } from './post.validation';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

@Injectable()
export class PostService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findUser(userId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getPostsCurrent(userId: number): Promise<PostResponse[]> {
    await this.findUser(userId);

    const result = await this.prismaService.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    return result.map((post) => ({
      id: post.id,
      userId: post.userId,
      author: post.user.name,
      slug: post.slug,
      image: post.image,
      description: post.description,
      createdAt: post.createdAt,
    }));
  }

  async createPost(
    user: User,
    request: CreatePostRequest,
  ): Promise<PostResponse> {
    this.logger.debug(`Register new user ${JSON.stringify(request)}`);

    const requestPost: CreatePostRequest = this.validationService.validate(
      PostValidation.CREATED,
      request,
    );

    const defaultImage = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    const randomString = nanoid(10);

    console.log(randomString);

    const slugPost = slugify(`${request.title} ${user.name} ${randomString}`, {
      lower: true,
      strict: true,
    });

    requestPost.image = defaultImage.resources[0].url;

    const result = await this.prismaService.post.create({
      data: {
        userId: user.id,
        title: request.title,
        slug: slugPost,
        image: requestPost.image,
        description: request.description,
      },
      include: {
        user: true,
      },
    });
    return {
      id: result.id,
      userId: result.userId,
      author: result.user.name,
      slug: result.slug,
      image: result.image,
      description: result.description,
      createdAt: result.createdAt,
    };
  }
}
