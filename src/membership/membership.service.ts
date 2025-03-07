import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateMembershipRequest,
  MembershipResponse,
} from '../model/membership.model';
import { PrismaService } from '../common/prisma.service';
import { ErrorMessage } from 'src/enum/error.enum';

@Injectable()
export class MembershipService {
  constructor(private prismaService: PrismaService) {}

  async createMembership(
    request: CreateMembershipRequest,
    userId: number,
  ): Promise<MembershipResponse> {
    const user = await this.prismaService.membership.findUnique({
      where: { userId },
    });
    if (user) {
      throw new HttpException(
        ErrorMessage.MEMBERSHIP_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const newMembership = await this.prismaService.membership.create({
      data: {
        userId: userId,
        amount: Number(request.amount),
      },
    });

    return {
      id: newMembership.id,
      userId: newMembership.userId,
      amount: newMembership.amount,
      createdAt: newMembership.createdAt,
    };
  }
}
