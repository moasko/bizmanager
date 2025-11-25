import { PrismaClient } from '@prisma/client'

// Declare a global variable to store the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new Prisma client instance or use the existing one
const client = globalThis.prisma || new PrismaClient();

// In development, store the Prisma client in the global variable to prevent creating multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client;
}

export const prisma = client;