import 'dotenv/config'
import { PrismaClient, AdminRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeon(sql)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Seeding initial admin user...')
    const passwordHash = await bcrypt.hash('WA_ChangeMe_2026!', 12)
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin@warriorsarena.com' },
      update: {},
      create: {
        email: 'admin@warriorsarena.com',
        passwordHash,
        name: 'Arena Owner',
        role: AdminRole.OWNER,
        isActive: true,
      },
    })
    console.log('Admin created/verified:', admin.email)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
