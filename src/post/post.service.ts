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
import { subject } from '@casl/ability';
import { Action } from '../enum/action.enum';
import { ErrorMessage } from '../enum/error.enum';

@Injectable()
export class PostService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private caslAbilityFactory: CaslAbilityFactory,
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

  private async findPost(postId: string): Promise<Post> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new HttpException(
        ErrorMessage.POST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return post;
  }

  private checkPermission(user: User, post: Post, action: Action) {
    const ability = this.caslAbilityFactory.createForPost(user);
    if (ability.cannot(action, subject('Post', post))) {
      throw new HttpException(ErrorMessage.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
  }

  private generateSlug(title: string): string {
    return slugify(`${title} ${nanoid(10)}`, {
      lower: true,
      strict: true,
    });
  }

  private toPostResponse(
    post: Post & { user: { name: string } },
  ): PostResponse {
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

  async getPostsByUserId(userId: number): Promise<PostResponse[]> {
    await this.findUser(userId);

    const post = await this.prismaService.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    return post.map((post) => this.toPostResponse(post));
  }

  async getPostByPostId(userId: number, postId: string): Promise<PostResponse> {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        userId: userId,
      },
      include: {
        user: true,
      },
    });
    if (!post) {
      throw new HttpException(
        ErrorMessage.POST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toPostResponse(post);
  }

  async beranda(userId: number): Promise<PostResponse[]> {
    const user = await this.findUser(userId);

    // Ambil daftar user yang di-follow
    const following = await this.prismaService.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    // Ambil hanya ID mereka dan tambahkan ID user sendiri
    const followedUserIds = following.map((follow) => follow.followingId);
    followedUserIds.push(user.id); // Tambahkan user.id agar postingannya sendiri juga muncul

    // Ambil post dari user yang di-follow termasuk dirinya sendiri
    const getPost = await this.prismaService.post.findMany({
      where: { userId: { in: followedUserIds } },
      include: { user: true },
    });

    // Kembalikan hasil yang benar
    return getPost.map((post) => this.toPostResponse(post));
  }

  async createPost(
    userId: number,
    request: CreatePostRequest,
    file: Express.Multer.File,
  ): Promise<PostResponse> {
    this.logger.debug(
      `User ${userId} is creating a post with title: ${request.title}`,
    );

    const user = await this.findUser(userId);

    const requestPost: CreatePostRequest = this.validationService.validate(
      PostValidation.CREATED,
      request,
    );

    const defaultImage = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    if (!requestPost.image) {
      requestPost.image = defaultImage.resources[0].url;
    }

    const slugPost = this.generateSlug(requestPost.title);

    const image = await this.cloudinaryService.uploadImage(file, {
      folder: 'post',
      resource_type: 'image',
      public_id: `${user.name}${user.id}${nanoid(10)}`,
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
    userId: number,
    postId: string,
    request: UpdatePostRequest,
  ): Promise<PostResponse> {
    this.validationService.validate(PostValidation.UPDATED, request);

    const user = await this.findUser(userId);
    const result = await this.findPost(postId);

    this.checkPermission(user, result, Action.Update);

    const slugPost = this.generateSlug(request.title);

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

  async deletePost(userId: number, postId: string): Promise<PostResponse> {
    const user = await this.findUser(userId);
    const post = await this.findPost(postId);

    this.checkPermission(user, post, Action.Delete);

    await this.prismaService.post.delete({
      where: { id: postId },
    });

    return {
      id: postId,
      userId: userId,
      author: user.name,
      title: post.title,
      slug: post.slug,
      image: post.image,
      description: post.description,
      createdAt: post.createdAt,
    };
  }
}
