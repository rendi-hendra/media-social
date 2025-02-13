import { Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FollowCountResponse } from 'src/model/follow.model';

@Injectable()
export class FollowService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async countFollow(userId: number): Promise<FollowCountResponse> {
    const countFollowers = await this.prismaService.follow.count({
      where: {
        followerId: userId,
      },
    });

    const countFollowing = await this.prismaService.follow.count({
      where: {
        followingId: userId,
      },
    });

    return {
      followers: countFollowers,
      following: countFollowing,
    };
  }
}
