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
import { FollowService } from './follow.service';
import {
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
} from '../model/follow.model';
import { AuthGuard } from '../common/auth.guard';
import { WebResponse } from '../model/web.model';
import { Auth } from 'src/common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/follows')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Get('/count/:userId')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async countFollow(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<FollowCountResponse>> {
    const result = await this.followService.countFollow(userId);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  async createFollow(
    @Auth() user: User,
    @Body() request: FollowRequest,
  ): Promise<WebResponse<FollowResponse>> {
    const result = await this.followService.follow(user, request);
    return {
      data: result,
    };
  }
}
