import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { CommentResponse } from '../model/comment.model';

@Injectable()
export class CommentService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async getConmment(postId: string): Promise<CommentResponse[]> {
    const comments = await this.prismaService.comment.findMany({
      where: { postId },
      select: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        id: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map((comment) => ({
      id: comment.id,
      name: comment.user.name,
      image: comment.user.image,
      content: comment.content,
      createdAt: comment.createdAt,
    }));
  }
}
