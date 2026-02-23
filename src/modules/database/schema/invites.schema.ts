import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';
// MUST match your DB enum exactly

export const invitesTable = pgTable(
  'invites',
  {
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
  },
  (table) => ({
    tokenIdx: uniqueIndex('invites_token_idx').on(table.token),
    emailIdx: index('invites_email_idx').on(table.email),
    expiresIdx: index('invites_expires_idx').on(table.expires_at),
    usedIdx: index('invites_used_idx').on(table.used_at),
    revokedIdx: index('invites_revoked_idx').on(table.revoked_at),
  }),
);

export type InvitesTableType = typeof invitesTable.$inferSelect;
export type InvitesInsertType = typeof invitesTable.$inferInsert;
