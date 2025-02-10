import { Controller, Get, HttpCode } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { ProfileResponse } from '../model/profile.model';

@Controller('/api/profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('/current')
  @HttpCode(200)
  async current(@Auth() user: User): Promise<WebResponse<ProfileResponse>> {
    const result = await this.profileService.getProfile(user);
    return {
      data: result,
    };
  }
}
