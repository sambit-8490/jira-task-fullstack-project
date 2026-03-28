import bcrypt from 'bcryptjs';
import { prisma } from '../models';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { REFRESH_TOKEN_TTL_MS, BCRYPT_ROUNDS } from '../utils/constants';
import { env } from '../config/env';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const refreshTokenExpiry = () => new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('Email already in use');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  const { passwordHash: _omit, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired or revoked');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true },
  });
  if (!user) throw new NotFoundError('User not found');

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  const newRefreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

export const cleanupExpiredTokens = async () => {
  if (env.NODE_ENV === 'test') return;
  const { count } = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (count > 0) console.log(`[Auth] Cleaned up ${count} expired refresh token(s)`);
};
