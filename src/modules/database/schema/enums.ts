import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role_enum', ['admin', 'hr', 'instructor', 'student']);
export const userStatusEnum = pgEnum('user_status_enum', ['active', 'invited', 'disabled']);
