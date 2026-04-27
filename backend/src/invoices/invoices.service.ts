import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { invoices, payments, Invoice, Payment } from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoicesService {
  constructor(@Inject(DATABASE_TOKEN) private db: DrizzleDB) {}

  async findAllForCustomer(customerId: string): Promise<Invoice[]> {
    return this.db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }

  async findById(id: string): Promise<Invoice> {
    const result = await this.db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!result[0]) throw new NotFoundException(`Invoice ${id} not found`);
    return result[0];
  }

  async findAll(): Promise<Invoice[]> {
    return this.db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async markPaid(invoiceId: string, reference: string): Promise<Invoice> {
    const result = await this.db
      .update(invoices)
      .set({
        status: 'paid',
        paystackReference: reference,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();
    return result[0];
  }

  async recordPayment(invoiceId: string, data: {
    amount: number;
    method: 'card' | 'mobile_money' | 'bank_transfer';
    provider?: 'mtn' | 'vodafone' | 'airteltigo';
    reference: string;
    transactionId?: string;
  }): Promise<Payment> {
    const result = await this.db.insert(payments).values({
      id: uuidv4(),
      invoiceId,
      amount: data.amount,
      paymentMethod: data.method,
      mobileMoneyProvider: data.provider ?? null,
      paystackReference: data.reference,
      paystackTransactionId: data.transactionId ?? null,
      status: 'success',
      paidAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }
}
