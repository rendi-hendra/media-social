import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CloudinaryService } from '../common/cloudinary.service';
import { Post, User } from '@prisma/client';
import {
  CreatePostRequest,
  PostResponse,
  UpdatePostRequest,
} from '../model/post.model';
import { PostValidation } from './post.validation';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { CaslAbilityFactory } from '../common/ability.factory';

@Injectable()
export class PostService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private caslAbilityFactory: CaslAbilityFactory,
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

  slugPost(title: string, name: string): string {
    const randomString = nanoid(10);
    return slugify(`${title} ${name} ${randomString}`, {
      lower: true,
      strict: true,
    });
  }

  toPostResponse(post: Post & { user: { name: string } }): PostResponse {
    return {
      id: post.id,
      userId: post.userId,
      author: post.user.name,
      title: post.title,
      slug: post.slug,
      image: post.image,
      description: post.description,
      createdAt: post.createdAt,
    };
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

    return result.map((post) => this.toPostResponse(post));
  }

  async createPost(
    user: User,
    request: CreatePostRequest,
    file: Express.Multer.File,
  ): Promise<PostResponse> {
    this.logger.debug(`Register new user ${JSON.stringify(request)}`);

    const randomString = nanoid(10);

    const requestPost: CreatePostRequest = this.validationService.validate(
      PostValidation.CREATED,
      request,
    );

    const defaultImage = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    const slugPost = slugify(`${request.title} ${user.name} ${randomString}`, {
      lower: true,
      strict: true,
    });

    if (!requestPost.image) {
      requestPost.image = defaultImage.resources[0].url;
    }

    const image = await this.cloudinaryService.uploadImage(file, {
      folder: 'post',
      resource_type: 'image',
      public_id: `${user.name}${user.id}${randomString}`,
      transformation: 'profile',
    });

    const result = await this.prismaService.post.create({
      data: {
        userId: user.id,
        title: request.title,
        slug: slugPost,
        image: request.image || image.url,
        description: request.description,
      },
      include: {
        user: true,
      },
    });
    return this.toPostResponse(result);
  }

  async updatePost(
    user: User,
    postId: string,
    request: UpdatePostRequest,
  ): Promise<PostResponse> {
    this.validationService.validate(PostValidation.UPDATED, request);
    const result = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!result) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (result.userId !== user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const slugPost = this.slugPost(request.title, user.name);

    const post = await this.prismaService.post.update({
      where: { id: postId },
      data: {
        ...request,
        slug: slugPost,
      },
      include: {
        user: true,
      },
    });
    return this.toPostResponse(post);
  }
}
