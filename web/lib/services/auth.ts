import { db } from '../db/client';
import { users, NewUser, User } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}) {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser: NewUser = {
    id: uuidv4(),
    email: data.email,
    passwordHash,
    fullName: data.fullName,
    phone: data.phone || null,
    role: (data.role as any) || 'customer',
  };

  const result = await db.insert(users).values(newUser).returning();
  const { passwordHash: _, ...userWithoutPassword } = result[0];
  
  return userWithoutPassword;
}

export async function validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return null;

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
