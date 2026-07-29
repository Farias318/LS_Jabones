import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { signAuthToken } from '../lib/jwt.js';
import type { LoginInput } from '../schemas/auth.schema.js';

export class InvalidCredentialsError extends Error {}

export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user) {
    throw new InvalidCredentialsError('Email o contraseña incorrectos');
  }

  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) {
    throw new InvalidCredentialsError('Email o contraseña incorrectos');
  }

  const token = signAuthToken({ sub: user.id, email: user.email, role: user.role });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}
