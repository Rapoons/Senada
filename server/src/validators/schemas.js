import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(150),
  password: z.string().min(1).max(100),
})

export const portfolioQuerySchema = z.object({
  category: z.string().trim().max(100).optional(),
  unggulan: z.enum(['true']).optional(),
})

export const slugSchema = z.string().trim().min(1).max(180)
