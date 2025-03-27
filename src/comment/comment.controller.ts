import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('/api/posts')
export class CommentController {
  constructor(private commentService: CommentService) {}
}
