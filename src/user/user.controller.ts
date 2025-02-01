import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { WebResponse } from './../model/web.model';
import { Request } from 'express';

@Controller('/api/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/csrf')
  @HttpCode(200)
  getCsrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
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
