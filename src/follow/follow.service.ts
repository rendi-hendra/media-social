import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
  FollowUserResponse,
} from '../model/follow.model';
import { User } from '@prisma/client';
import { FollowValidation } from './follow.validation';
import { ErrorMessage } from '../enum/error.enum';

@Injectable()
export class FollowService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async findUser(userId: number): Promise<User> {
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

  async countFollow(userId: number): Promise<FollowCountResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
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

  async getFollows(userId: number): Promise<FollowUserResponse> {
    const user = await this.findUser(userId);

    const [following, followers] = await Promise.all([
      await this.prismaService.follow.findMany({
        where: {
          followerId: userId,
          status: 'ACCEPTED',
        },
        include: {
          following: true,
        },
      }),

      await this.prismaService.follow.findMany({
        where: {
          followingId: userId,
          status: 'ACCEPTED',
        },
        include: {
          follower: true,
        },
      }),
    ]);

    return {
      id: user.id,
      followers: followers.map((follower) => ({
        id: follower.follower.id,
        username: follower.follower.username,
        name: follower.follower.name,
      })),
      following: following.map((following) => ({
        id: following.following.id,
        username: following.following.username,
        name: following.following.name,
      })),
    };
  }

  async follow(
    userId: number,
    request: FollowRequest,
  ): Promise<FollowResponse> {
    this.logger.debug(`Request Follow: ${JSON.stringify(request)}`);
    const user = await this.findUser(userId);

    const followRequest: FollowRequest = this.validationService.validate(
      FollowValidation.FOLLOW,
      request,
    );

    if (user.id === followRequest.id) {
      throw new HttpException(
        ErrorMessage.CANNOT_FOLLOW_YOURSELF,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Optimasi query dengan Promise.all
    const [userFollowing, existingFollow] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { id: followRequest.id },
      }),
      this.prismaService.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: followRequest.id,
          },
        },
      }),
    ]);

    if (!userFollowing) {
      throw new HttpException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingFollow) {
      throw new HttpException(
        ErrorMessage.ALREADY_FOLLOWING,
        HttpStatus.CONFLICT,
      );
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
        username: userFollowing.username,
        name: userFollowing.name,
      },
    };
  }

  async updateStatus(
    userId: number,
    request: FollowRequest,
  ): Promise<FollowResponse> {
    this.logger.debug(`Update status follow: ${JSON.stringify(request)}`);

    const user = await this.findUser(userId);

    const followRequest: FollowRequest = this.validationService.validate(
      FollowValidation.FOLLOW,
      request,
    );

    if (user.id === followRequest.id) {
      throw new HttpException(
        ErrorMessage.CANNOT_UPDATE_STATUS_YOURSELF,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Optimasi query dengan Promise.all
    const [userFollowing, followRecord] = await Promise.all([
      this.prismaService.user.findUnique({ where: { id: followRequest.id } }),
      this.prismaService.follow.findFirst({
        where: {
          followerId: followRequest.id,
          followingId: user.id,
        },
      }),
    ]);

    if (!userFollowing) {
      throw new HttpException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!followRecord) {
      throw new HttpException(
        ErrorMessage.FOLLOW_REQUEST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (followRecord.status === 'ACCEPTED') {
      throw new HttpException(
        ErrorMessage.STATUS_ALREADY_ACCEPTED,
        HttpStatus.CONFLICT,
      );
    }

    // Update follow request menjadi ACCEPTED
    const updatedFollow = await this.prismaService.follow.update({
      where: {
        followerId_followingId: {
          followerId: followRequest.id, // Orang yang nge-follow
          followingId: user.id, // User yang login (harusnya di-follow)
        },
      },
      data: { status: 'ACCEPTED' },
    });

    return {
      status: updatedFollow.status,
      following: {
        id: userFollowing.id,
        username: userFollowing.username,
        name: userFollowing.name,
      },
    };
  }

  async unfollow(
    userId: number,
    request: FollowRequest,
  ): Promise<{ message: string }> {
    this.logger.debug(`Unfollow: ${JSON.stringify(request)}`);

    const user = await this.findUser(userId);

    const unfollowRequest: FollowRequest = this.validationService.validate(
      FollowValidation.FOLLOW,
      request,
    );

    if (user.id === unfollowRequest.id) {
      throw new HttpException(
        ErrorMessage.CANNOT_UNFOLLOW_YOURSELF,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Optimasi query dengan Promise.all
    const [userFollowing, followRecord] = await Promise.all([
      this.prismaService.user.findUnique({ where: { id: unfollowRequest.id } }),
      this.prismaService.follow.findFirst({
        where: {
          followerId: user.id, // Orang yang nge-follow
          followingId: unfollowRequest.id, // Orang yang di-follow
        },
      }),
    ]);

    if (!userFollowing) {
      throw new HttpException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!followRecord) {
      throw new HttpException(
        ErrorMessage.FOLLOW_REQUEST_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // Hapus follow record
    await this.prismaService.follow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id, // Orang yang nge-follow
          followingId: unfollowRequest.id, // Orang yang di-follow
        },
      },
    });

    return { message: 'Unfollowed successfully' };
  }
}
