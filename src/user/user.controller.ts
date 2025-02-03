import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { WebResponse } from './../model/web.model';
import { Request } from 'express';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/csrf')
  @HttpCode(200)
  CsrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }

  @Get()
  @HttpCode(200)
  async current(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.current(user);
    return {
      data: result,
    };
  }

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
}
