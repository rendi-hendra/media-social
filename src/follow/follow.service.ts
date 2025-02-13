import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
} from 'src/model/follow.model';
import { User } from '@prisma/client';
import { FollowValidation } from './follow.validation';

@Injectable()
export class FollowService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async countFollow(userId: number): Promise<FollowCountResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const [countFollowers, countFollowing] = await Promise.all([
      this.prismaService.follow.count({
        where: {
          followerId: userId,
          status: 'ACCEPTED',
        },
      }),
      this.prismaService.follow.count({
        where: {
          followingId: userId,
          status: 'ACCEPTED',
        },
      }),
    ]);

    return {
      followers: countFollowing,
      following: countFollowers,
    };
  }

  async follow(user: User, request: FollowRequest): Promise<FollowResponse> {
    this.logger.debug(`Request Follow: ${request}`);

    const followRequest: FollowRequest = this.validationService.validate(
      FollowValidation.FOLLOW,
      request,
    );

    if (user.id == followRequest.id) {
      throw new HttpException('Cannot follow yourself', HttpStatus.BAD_REQUEST);
    }

    const userFollowing = await this.prismaService.user.findUnique({
      where: {
        id: followRequest.id,
      },
    });

    if (!userFollowing) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const existingFollow = await this.prismaService.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: followRequest.id,
        },
      },
    });

    if (existingFollow) {
      throw new HttpException('Already following', HttpStatus.CONFLICT);
    }

    const following = await this.prismaService.follow.create({
      data: {
        followerId: user.id,
        followingId: followRequest.id,
      },
    });

    return {
      status: following.status,
      following: {
        id: userFollowing.id,
        name: userFollowing.name,
      },
    };
  }
}
