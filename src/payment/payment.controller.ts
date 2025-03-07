import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from '../common/public.decorator';
import {
  CreateAccountGopay,
  CreateTransactionRequest,
} from './../model/payment.model';
import { JwtRequest } from '../model/jwt.model';

@Controller('/api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('/account/:accountId')
  @HttpCode(200)
  async getAccountGopay(@Param('accountId') accountId: string) {
    const result = await this.paymentService.getAccountGopay(accountId);
    return {
      data: result,
    };
  }

  @Post('/account')
  @HttpCode(201)
  async createAccountGopay(@Body() request: CreateAccountGopay) {
    const result = await this.paymentService.createAccountGopay(request);
    return {
      data: result,
    };
  }

  @Post('/transaction')
  @HttpCode(200)
  async createTransaction(
    @Body() amount: CreateTransactionRequest,
    @Req() request: JwtRequest,
  ) {
    const userId = request.user.sub;
    const result = await this.paymentService.createTransaction(userId, amount);
    return {
      data: result,
    };
  }

  @Get('/transaction/:orderId/status')
  @HttpCode(200)
  async getStatusTransaction(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getSatusTransaction(orderId);
    return {
      data: result,
    };
  }

  @Get('/transaction/:orderId/')
  @HttpCode(200)
  async updateStatusTransaction(@Param('orderId') orderId: string) {
    const result = await this.paymentService.updateStatusTransaction(orderId);
    return {
      data: result,
    };
  }

  @Public()
  @HttpCode(200)
  @Post('/midtrans')
  async handleMidtransWebhook(@Body() body: any) {
    const result = await this.paymentService.updateStatusTransaction(body);
    return {
      data: result,
    };
  }
}
