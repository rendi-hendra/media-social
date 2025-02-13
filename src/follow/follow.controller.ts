import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowCountResponse } from '../model/follow.model';
import { AuthGuard } from '../common/auth.guard';
import { WebResponse } from '../model/web.model';

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
}
