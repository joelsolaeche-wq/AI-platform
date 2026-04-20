import { PrismaClient } from '@prisma/client';

let instance: PrismaClient | null = null;

/** Singleton Prisma client shared across repositories. */
export function getPrisma(): PrismaClient {
  if (!instance) {
    instance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return instance;
}
