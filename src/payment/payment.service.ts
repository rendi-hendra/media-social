import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  CreateAccountGopay,
  CreateTransactionRequest,
} from '../model/payment.model';
import { nanoid } from 'nanoid';
import { PrismaService } from '../common/prisma.service';
import { ErrorMessage } from '../enum/error.enum';
import { MembershipStatus } from '../enum/status.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private prismaService: PrismaService,
  ) {}
  private serverKey = this.configService.get('SERVER_KEY');
  private token = btoa(this.serverKey);

  async getAccountGopay(accountId: string) {
    const url = `https://api.sandbox.midtrans.com/v2/pay/account/${accountId}`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    });
    return response.data;
  }
  async createAccountGopay(request: CreateAccountGopay) {
    const url = 'https://api.sandbox.midtrans.com/v2/pay/account';

    const response = await axios.post(url, request, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    });
    return response.data;
  }

  async createTransaction(userId: number, request: CreateTransactionRequest) {
    const url = this.configService.get('SANDBOX_URL');

    const [membership, membershipTransaction] = await Promise.all([
      this.prismaService.membership.findUnique({
        where: {
          id: request.membershipId,
        },
      }),
      this.prismaService.transaction.findUnique({
        where: {
          membershipId_userId: {
            userId,
            membershipId: request.membershipId,
          },
        },
      }),
    ]);

    if (!membership) {
      throw new HttpException(
        ErrorMessage.MEMBERSHIP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (membershipTransaction.status == MembershipStatus.SATTLEMENT) {
      throw new HttpException(
        ErrorMessage.MEMBERSHIP_ALREADY_BOUGHT,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (membershipTransaction.status == MembershipStatus.PENDING) {
      const transaction = await this.prismaService.transaction.findUnique({
        where: {
          membershipId_userId: {
            userId,
            membershipId: request.membershipId,
          },
        },
      });

      return transaction;
    }

    const body = {
      transaction_details: {
        order_id: nanoid(10),
        gross_amount: membership.amount,
      },
    };

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    });

    const result = await this.prismaService.transaction.create({
      data: {
        orderId: body.transaction_details.order_id,
        membershipId: request.membershipId,
        userId: userId,
        token: response.data.token,
        redirectUrl: response.data.redirect_url,
      },
      include: {
        membership: true,
      },
    });

    return {
      ...result,
    };
  }

  async getSatusTransaction(orderId: string) {
    const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    });
    return response.data;
  }

  async updateStatusTransaction(body: any) {
    if (body.transaction_status === 'settlement') {
      const response = await this.prismaService.transaction.update({
        where: { orderId: body.order_id },
        data: { status: 'SETTLEMENT' },
      });

      return response;
    }
  }
}
