import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum } from '#/modules/database/schema/enums';

export const invitesTable = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email').notNull(),
  first_name: varchar('first_name'),
  last_name: varchar('last_name'),
  role: userRoleEnum('role').notNull(),
  token: varchar('token').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  used_at: timestamp('used_at', { withTimezone: true }),
  revoked_at: timestamp('revoked_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type InvitesTableType = typeof invitesTable.$inferSelect;
export type InvitesInsertType = typeof invitesTable.$inferInsert;
