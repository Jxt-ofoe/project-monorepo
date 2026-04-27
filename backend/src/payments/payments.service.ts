import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { invoices, shipments } from '../database/schema';
import { eq } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackUrl = 'https://api.paystack.co';

  constructor(
    private configService: ConfigService,
    @Inject(DATABASE_TOKEN) private db: DrizzleDB,
    private notificationsService: NotificationsService,
  ) {}

  private get secretKey() {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY') || 'sk_test_placeholder';
  }

  async initializeTransaction(email: string, amountGhs: number, metadata: any) {
    try {
      const response = await axios.post(
        `${this.paystackUrl}/transaction/initialize`,
        {
          email,
          amount: Math.round(amountGhs * 100), // Paystack uses pesewas (100 = 1 GHS)
          currency: 'GHS',
          metadata,
          callback_url: `${this.configService.get('FRONTEND_URL')}/dashboard/customer?payment=success`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data; // { authorization_url, access_code, reference }
    } catch (error: any) {
      this.logger.error('Failed to initialize Paystack transaction', error.response?.data || error.message);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(`${this.paystackUrl}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      return response.data.data;
    } catch (error: any) {
      this.logger.error('Failed to verify Paystack transaction', error.response?.data || error.message);
      throw new Error('Payment verification failed');
    }
  }

  async handleWebhook(payload: any) {
    const { event, data } = payload;

    if (event === 'charge.success') {
      const { reference, metadata } = data;
      const { shipmentId, invoiceId, customerId } = metadata;

      this.logger.log(`Payment successful for shipment ${shipmentId}, reference: ${reference}`);

      // 1. Update Invoice
      if (invoiceId) {
        await this.db
          .update(invoices)
          .set({ 
            status: 'paid', 
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
          })
          .where(eq(invoices.id, invoiceId));
      }

      // 2. Update Shipment Status to 'paid' (if applicable)
      if (shipmentId) {
        await this.db
          .update(shipments)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(shipments.id, shipmentId));
      }

      // 3. Notify User
      if (customerId) {
        this.notificationsService.notifyUser(customerId, 'payment_confirmed', {
          shipmentId,
          reference,
          amount: data.amount / 100,
        });
      }
    }

    return { status: 'success' };
  }
}
