import { Controller, Post, Body, Get, Query, UseGuards, Request, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  async initialize(@Body() body: { email: string; amount: number; metadata: any }) {
    return this.paymentsService.initializeTransaction(body.email, body.amount, body.metadata);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verify(@Query('reference') reference: string) {
    return this.paymentsService.verifyTransaction(reference);
  }

  /**
   * Paystack Webhook endpoint (Public)
   * In production, you should verify the Paystack signature (X-Paystack-Signature)
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
