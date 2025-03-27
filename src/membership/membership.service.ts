import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateAndUpdateMembershipRequest,
  MembershipResponse,
} from '../model/membership.model';
import { PrismaService } from '../common/prisma.service';
import { ErrorMessage } from 'src/enum/error.enum';

@Injectable()
export class MembershipService {
  constructor(private prismaService: PrismaService) {}

  async createMembership(
    request: CreateAndUpdateMembershipRequest,
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

  async updateMembership(
    request: CreateAndUpdateMembershipRequest,
    userId: number,
  ): Promise<MembershipResponse> {
    const membership = await this.prismaService.membership.findUnique({
      where: { userId },
    });

    if (!membership) {
      throw new HttpException(
        ErrorMessage.MEMBERSHIP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedMembership = await this.prismaService.membership.update({
      where: { userId: membership.userId },
      data: { amount: Number(request.amount) },
    });

    return {
      id: updatedMembership.id,
      userId: updatedMembership.userId,
      amount: updatedMembership.amount,
      createdAt: updatedMembership.createdAt,
    };
  }
}
