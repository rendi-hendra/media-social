import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserRequest,
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { WebResponse } from './../model/web.model';
import { Request } from 'express';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { Public } from '../common/public.decorator';

@Controller('/api/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/csrf')
  @HttpCode(200)
  csrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }

  @Get('/:userId')
  @HttpCode(200)
  async getUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.getUser(userId);
    return {
      data: result,
    };
  }

  @Public()
  @Post()
  @HttpCode(201)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);
    return {
      data: result,
    };
  }

  @Delete('/logout')
  @HttpCode(200)
  async logout(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.logout(user);
    return {
      data: result,
    };
  }

  @Delete('/current')
  @HttpCode(200)
  async delete(
    @Auth() user: User,
    @Body() request: DeleteUserRequest,
  ): Promise<WebResponse<boolean>> {
    await this.userService.delete(user, request);
    return {
      data: true,
    };
  }
}
