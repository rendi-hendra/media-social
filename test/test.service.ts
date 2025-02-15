import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
// import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { CloudinaryService } from '../src/common/cloudinary.service';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async deleteAll() {
    await this.deleteUser();
  }

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        name: 'test',
        username: 'test',
        email: 'test@example.com',
        password: await bcrypt.hash('test', 10),
        image: (await this.cloudinaryService.getResources(['profile/default']))
          .resources[0].url,
        token: 'test',
        createdAt: DateTime.local().toISO(),
      },
    });
  }

  async getUser() {
    return await this.prismaService.user.findFirst({
      where: {
        name: 'test',
      },
      omit: {
        password: true,
        token: true,
      },
    });
  }
}
