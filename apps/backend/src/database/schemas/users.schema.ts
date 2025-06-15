import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Define user roles enum
export const userRoleEnum = pgEnum('user_role', ['public', 'user', 'admin']);

// Users table schema
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('user').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    createdAtIdx: index('users_created_at_idx').on(table.createdAt),
  }),
);

// Role validation schema
export const roleSchema = z.enum(['public', 'user', 'admin']);

// Manual Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleSchema.default('user'),
  emailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  role: roleSchema.optional(),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: roleSchema,
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TypeScript types
export type UserRole = z.infer<typeof roleSchema>;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
