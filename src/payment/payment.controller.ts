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
  CreateTransactionRequest,
  PaymentResponse,
} from './../model/payment.model';
import { JwtRequest } from '../model/jwt.model';
import { WebResponse } from '../model/web.model';

@Controller('/api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('/transaction/:orderId/status')
  @HttpCode(200)
  async getStatusTransaction(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getSatusTransaction(orderId);
    return {
      data: result,
    };
  }

  @Get('/transaction/:orderId')
  @HttpCode(200)
  async updateStatusTransaction(@Param('orderId') orderId: string) {
    const result = await this.paymentService.getTransaction(orderId);
    return {
      data: result,
    };
  }

  @Post('/transaction')
  @HttpCode(200)
  async createTransaction(
    @Body() body: CreateTransactionRequest,
    @Req() request: JwtRequest,
  ): Promise<WebResponse<PaymentResponse>> {
    const userId = request.user.sub;
    const result = await this.paymentService.createTransaction(userId, body);
    return {
      data: result,
    };
  }

  @Public()
  @HttpCode(200)
  @Post('/midtrans')
  async handleMidtransWebhook(@Body() body: any) {
    const result = await this.paymentService.handleMidtransWebhook(body);
    return {
      data: result,
    };
  }
}
