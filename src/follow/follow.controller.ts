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
} from '@nestjs/common';
import { FollowService } from './follow.service';
import {
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
  FollowUserResponse,
} from '../model/follow.model';
import { WebResponse } from '../model/web.model';
import { JwtRequest } from '../model/jwt.model';

@Controller('/api/follows')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Get('/count/:userId')
  @HttpCode(200)
  async countFollow(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<FollowCountResponse>> {
    const result = await this.followService.countFollow(userId);
    return {
      data: result,
    };
  }

  @Get('/:userId')
  @HttpCode(200)
  async getFollows(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<FollowUserResponse>> {
    const result = await this.followService.getFollows(userId);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  async createFollow(
    @Req() req: JwtRequest,
    @Body() request: FollowRequest,
  ): Promise<WebResponse<FollowResponse>> {
    const userId: number = req.user.sub;
    const result = await this.followService.follow(userId, request);
    return {
      data: result,
    };
  }

  @Patch('/status')
  @HttpCode(200)
  async updateStatus(
    @Req() req: JwtRequest,
    @Body() request: FollowRequest,
  ): Promise<WebResponse<FollowResponse>> {
    const userId: number = req.user.sub;
    const result = await this.followService.updateStatus(userId, request);
    return {
      data: result,
    };
  }

  @Delete()
  @HttpCode(200)
  async unfollow(
    @Req() req: JwtRequest,
    @Body() request: FollowRequest,
  ): Promise<WebResponse<{ message: string }>> {
    const userId: number = req.user.sub;
    const result = await this.followService.unfollow(userId, request);
    return {
      data: result,
    };
  }
}
