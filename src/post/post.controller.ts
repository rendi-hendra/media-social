import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { CreatePostRequest, PostResponse } from '../model/post.model';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/api/posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/:userId')
  @HttpCode(200)
  async getPostsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<PostResponse[]>> {
    const result = await this.postService.getPostsByUserId(userId);
    return {
      data: result,
    };
  }

  @Get('/:userId/:postId')
  @HttpCode(200)
  async getPostsByPostId(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('postId') postId: string,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.getPostByPostId(userId, postId);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  async getfollow(@Auth() user: User): Promise<WebResponse<PostResponse[]>> {
    const result = await this.postService.beranda(user);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file')) // Tangkap file yang diunggah
  async createPost(
    @Auth() user: User,
    @Body() request: CreatePostRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.createPost(user, request, file);
    return {
      data: result,
    };
  }

  @Patch('/:postId')
  @HttpCode(200)
  async updatePost(
    @Auth() user: User,
    @Param('postId') postId: string,
    @Body() request: CreatePostRequest,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.updatePost(user, postId, request);
    return {
      data: result,
    };
  }

  @Delete('/:postId')
  @HttpCode(200)
  async deletePost(
    @Auth() user: User,
    @Param('postId') postId: string,
  ): Promise<WebResponse<boolean>> {
    const result = await this.postService.deletePost(user, postId);
    return {
      data: result,
    };
  }
}
