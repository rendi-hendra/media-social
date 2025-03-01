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
import { Public } from '../common/public.decorator';
import { JwtRequest } from '../model/jwt.model';

@Controller('/api/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Public()
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

  @Delete('/current')
  @HttpCode(200)
  async delete(
    @Req() req: JwtRequest,
    @Body() request: DeleteUserRequest,
  ): Promise<WebResponse<boolean>> {
    const userId: number = req.user.sub;
    await this.userService.delete(userId, request);
    return {
      data: true,
    };
  }
}
