import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { ProfileResponse } from '../model/profile.model';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Patch('/current')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file')) // Tangkap file yang diunggah
  async updateProfile(
    @Auth() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<ProfileResponse>> {
    const result = await this.profileService.updateProfile(user, file);
    return {
      data: result,
    };
  }

  @Delete('/current')
  @HttpCode(200)
  async deleteProfile(
    @Auth() user: User,
  ): Promise<WebResponse<ProfileResponse>> {
    const result = await this.profileService.deleteProfile(user);
    return {
      data: result,
    };
  }
}
