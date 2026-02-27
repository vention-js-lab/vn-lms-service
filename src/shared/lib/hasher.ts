import { hash as ahash, verify as averify } from 'argon2';

export class Hasher {
  static async hash(value: string) {
    return await ahash(value);
  }
  static async verify(hashed: string, value: string) {
    return await averify(hashed, value);
  }
}
