import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { users, NewUser, User } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async create(user: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const all = await this.db.select().from(users);
    return all.map(({ passwordHash, ...u }) => u);
  }

  async update(id: string, data: Partial<Pick<User, 'fullName' | 'phone' | 'role' | 'isActive'>>): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    const result = await this.db.update(users).set({
      ...data,
      updatedAt: new Date().toISOString(),
    }).where(eq(users.id, id)).returning();
    const { passwordHash, ...u } = result[0];
    return u;
  }
}
