import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
// import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

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
    // const now = DateTime.local().setZone('Asia/Jakarta');

    await this.prismaService.user.create({
      data: {
        name: 'test',
        email: 'test@example.com',
        password: await bcrypt.hash('test', 10),
        image:
          'https://res.cloudinary.com/dlikh4kok/image/upload/v1739199893/profile/default.png',
        token: 'test',
        createdAt: DateTime.local().toString(),
      },
    });
  }
}
