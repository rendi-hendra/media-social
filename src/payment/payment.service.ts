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

    const membership = await this.prismaService.transaction.findUnique({
      where: {
        membershipId_userId: {
          userId,
          membershipId: request.membershipId,
        },
      },
    });

    if (membership) {
      throw new HttpException(
        ErrorMessage.MEMBERSHIP_ALREADY_BOUGHT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const transaction = await this.prismaService.transaction.create({
      data: {
        orderId: nanoid(10),
        membershipId: request.membershipId,
        userId: userId,
      },
      include: {
        membership: true,
      },
    });

    const body = {
      transaction_details: {
        order_id: transaction.orderId,
        gross_amount: transaction.membership.amount,
      },
    };

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.token}`,
      },
    });

    return {
      orderId: transaction.orderId,
      token: response.data.token,
      redirectUrl: response.data.redirect_url,
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
