import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = 'admin@platform.dev';
  const plainPassword = 'Admin1234!';
  const saltRounds = 12;

  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((err: unknown) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
