import { type User } from '#/modules/database/schema';

export type AuthPayload = {
  sub: string; //id
  email: string;
  role: User['role'];
};
