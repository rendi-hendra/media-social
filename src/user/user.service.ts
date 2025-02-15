import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  DeleteUserRequest,
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';
import { CloudinaryService } from '../common/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async current(user: User): Promise<UserResponse> {
    this.logger.debug(`Get current user ${JSON.stringify(user)}`);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    };
  }

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`Register new user ${JSON.stringify(request)}`);

    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const [userWithSameUsername, userWithSameEmail] = await Promise.all([
      this.prismaService.user.findUnique({
        where: {
          username: registerRequest.username,
        },
      }),

      this.prismaService.user.findUnique({
        where: {
          email: registerRequest.email,
        },
      }),
    ]);

    if (userWithSameUsername) {
      throw new HttpException('Username already exists', 409);
    }

    if (userWithSameEmail) {
      throw new HttpException('Email already exists', 409);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const getProfile = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    registerRequest.image = getProfile.resources[0].url;

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`Login user ${JSON.stringify(request)}`);

    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
        email: loginRequest.email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid email or password', 401);
    }

    user = await this.prismaService.user.update({
      where: {
        email: loginRequest.email,
      },
      data: {
        token: uuid(),
      },
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token: user.token,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    this.logger.debug(`Logout user ${JSON.stringify(user)}`);
    const updatedUser = await this.prismaService.user.update({
      where: {
        email: user.email,
      },
      data: {
        token: null,
      },
    });
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      token: updatedUser.token,
    };
  }

  async delete(user: User, request: DeleteUserRequest): Promise<UserResponse> {
    this.logger.debug(`Delete user ${JSON.stringify(user)}`);

    const userRequest: DeleteUserRequest = this.validationService.validate(
      UserValidation.DELETE,
      request,
    );

    const isPasswordValid = await bcrypt.compare(
      userRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid password', 401);
    }

    await this.prismaService.user.delete({
      where: {
        email: user.email,
      },
    });
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
