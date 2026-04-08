import 'dotenv/config'
import { PrismaClient, AdminRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

console.log('All modules loaded successfully');
