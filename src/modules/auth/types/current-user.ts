import { type UserRole } from '#/modules/database/schema';

export type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
};
