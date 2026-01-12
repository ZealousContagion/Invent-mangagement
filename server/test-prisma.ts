import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient({});
  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    await prisma.$disconnect();
  } catch (e) {
    console.error('Connection failed:', e);
  }
}

main();
