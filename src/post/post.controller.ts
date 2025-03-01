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
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { WebResponse } from '../model/web.model';
import { CreatePostRequest, PostResponse } from '../model/post.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtRequest } from '../model/jwt.model';

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
  async getfollow(
    @Req() req: JwtRequest,
  ): Promise<WebResponse<PostResponse[]>> {
    const userId: number = req.user.sub;
    const result = await this.postService.beranda(userId);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file')) // Tangkap file yang diunggah
  async createPost(
    @Req() req: JwtRequest,
    @Body() request: CreatePostRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<PostResponse>> {
    const userId: number = req.user.sub;
    const result = await this.postService.createPost(userId, request, file);
    return {
      data: result,
    };
  }

  @Patch('/:postId')
  @HttpCode(200)
  async updatePost(
    @Req() req: JwtRequest,
    @Param('postId') postId: string,
    @Body() request: CreatePostRequest,
  ): Promise<WebResponse<PostResponse>> {
    const userId: number = req.user.sub;
    const result = await this.postService.updatePost(userId, postId, request);
    return {
      data: result,
    };
  }

  @Delete('/:postId')
  @HttpCode(200)
  async deletePost(
    @Req() req: JwtRequest,
    @Param('postId') postId: string,
  ): Promise<WebResponse<boolean>> {
    const userId: number = req.user.sub;
    const result = await this.postService.deletePost(userId, postId);
    return {
      data: result,
    };
  }
}
