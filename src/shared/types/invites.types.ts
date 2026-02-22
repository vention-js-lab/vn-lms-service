export type InviteRole = 'admin' | 'hr' | 'instructor' | 'student';
export interface InvitesTableType {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: InviteRole;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
}
