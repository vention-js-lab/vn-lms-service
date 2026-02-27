import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const userRoleEnum = pgEnum('user_role_enum', ['admin', 'hr', 'instructor', 'student']);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const userStatusEnum = pgEnum('user_status_enum', ['active', 'disabled']);
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
  status: userStatusEnum('status').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

export type CreateUserParams = typeof users.$inferInsert;
export type UpdateUserParams = Partial<Omit<typeof users.$inferInsert, 'id'>> & { id: string };
