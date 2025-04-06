import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { WebResponse } from '../model/web.model';
import { CommentResponse } from '../model/comment.model';

@Controller('/api/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('/:postId')
  @HttpCode(200)
  async getComments(
    @Param('postId') postId: string,
  ): Promise<WebResponse<CommentResponse[]>> {
    const result = await this.commentService.getConmment(postId);
    return {
      data: result,
    };
  }
}
