import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post..service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { CreatePostRequest, PostResponse } from '../model/post.model';
import { AuthGuard } from '../common/auth.guard';

@Controller('/api/posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/:userId')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async current(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<PostResponse[]>> {
    const result = await this.postService.getPostsCurrent(userId);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  async createPost(
    @Auth() user: User,
    @Body() request: CreatePostRequest,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.createPost(user, request);
    return {
      data: result,
    };
  }
}
