import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role_enum', ['ADMIN', 'HR', 'INSTRUCTOR', 'STUDENT']);
export const userStatusEnum = pgEnum('user_status_enum', ['ACTIVE', 'INVITED', 'DISABLED']);
