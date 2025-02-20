import { Controller, Get, HttpCode } from '@nestjs/common';
import { PostService } from './post..service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { PostResponse } from '../model/post.model';

@Controller('/api/posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/current')
  @HttpCode(200)
  async current(@Auth() user: User): Promise<WebResponse<PostResponse[]>> {
    const result = await this.postService.getPostsCurrent(user);
    return {
      data: result,
    };
  }
}
