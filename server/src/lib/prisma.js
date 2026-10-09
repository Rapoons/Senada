import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../prisma/generated/client.ts'

// Prisma 7 memakai driver adapter. Adapter MariaDB juga dipakai untuk MySQL (XAMPP = MariaDB).
// URL koneksi tetap satu sumber: DATABASE_URL di .env.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL)

export const prisma = new PrismaClient({ adapter })
