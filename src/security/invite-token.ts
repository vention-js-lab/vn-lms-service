import argon2 from 'argon2';

export async function hashInviteToken(token: string): Promise<string> {
  return argon2.hash(token, {
    type: argon2.argon2id,
  });
}
