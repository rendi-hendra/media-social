import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { User } from '@prisma/client';
import { CloudinaryService } from '../common/cloudinary.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private jwtService: JwtService,
  ) {}

  toResponseUser(user: User, includeTokenAndusername = false): UserResponse {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      createdAt: user.createdAt,
      ...(includeTokenAndusername ? { email: user.email } : {}),
      ...(includeTokenAndusername && user.token ? { token: user.token } : {}),
    };
  }

  async findUser(userId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getUser(userId: number): Promise<UserResponse> {
    const user = await this.findUser(userId);
    this.logger.debug(`Get current user ${JSON.stringify(user)}`);
    return this.toResponseUser(user);
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
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }

    if (userWithSameEmail) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const getProfile = await this.cloudinaryService.getResources([
      'profile/default',
    ]);

    registerRequest.image = getProfile.resources[0].url;

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });
    return this.toResponseUser(user);
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`Login user ${JSON.stringify(request)}`);

    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
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

    const payload = { sub: user.id, name: user.name, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    user.token = access_token;

    return this.toResponseUser(user, true);
  }

  async delete(
    userId: number,
    request: DeleteUserRequest,
  ): Promise<UserResponse> {
    this.logger.debug(`Delete user ${JSON.stringify(request)}`);
    console.log(userId);

    const userRequest: DeleteUserRequest = this.validationService.validate(
      UserValidation.DELETE,
      request,
    );

    const user = await this.findUser(userId);

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

    return this.toResponseUser(user);
  }
}
