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

    const [user, membership, transaction] = await Promise.all([
      this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      }),
      this.prismaService.membership.findUnique({
        where: {
          id: request.membershipId,
        },
        include: {
          user: true,
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

    if (transaction) {
      throw new HttpException(
        ErrorMessage.TRANSACTION_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const body = {
      transaction_details: {
        order_id: nanoid(10),
        gross_amount: membership.amount,
      },
      item_details: [
        {
          id: membership.id,
          price: membership.amount,
          quantity: 1,
          name: `Membership ${membership.user.name}`,
          brand: 'Membership',
          category: 'Membership',
          merchant_name: 'Rendi media social',
        },
      ],
      customer_details: {
        id: user.id,
        first_name: user.name,
        email: user.email,
      },
      page_expiry: {
        duration: 1,
        unit: 'hours',
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
    });

    return result;
  }

  async getTransaction(orderId: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { orderId },
    });

    if (!transaction) {
      throw new HttpException(
        ErrorMessage.TRANSACTION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return transaction;
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

  async handleMidtransWebhook(body: any) {
    if (body.transaction_status === 'settlement') {
      const response = await this.prismaService.transaction.update({
        where: { orderId: body.order_id },
        data: { status: 'SETTLEMENT' },
      });

      return response;
    }
    if (body.transaction_status === 'expire') {
      const response = await this.prismaService.transaction.delete({
        where: { orderId: body.order_id },
      });

      return response;
    }
  }
}
