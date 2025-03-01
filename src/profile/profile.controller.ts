import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { WebResponse } from '../model/web.model';
import { ProfileResponse } from '../model/profile.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtRequest } from '../model/jwt.model';

@Controller('/api/profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('/current')
  @HttpCode(200)
  async current(@Req() req: JwtRequest): Promise<WebResponse<ProfileResponse>> {
    const userId: number = req.user.sub;
    const result = await this.profileService.getProfile(userId);
    return {
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file')) // Tangkap file yang diunggah
  async updateProfile(
    @Req() req: JwtRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<ProfileResponse>> {
    const userId: number = req.user.sub;
    const result = await this.profileService.updateProfile(userId, file);
    return {
      data: result,
    };
  }

  @Delete('/current')
  @HttpCode(200)
  async deleteProfile(
    @Req() req: JwtRequest,
  ): Promise<WebResponse<ProfileResponse>> {
    const userId: number = req.user.sub;
    const result = await this.profileService.deleteProfile(userId);
    return {
      data: result,
    };
  }
}
