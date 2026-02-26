import { Injectable } from '@nestjs/common';
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { DatabaseService } from '#/modules/database/database.service';
import { users } from '#/modules/database/schema';

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.databaseService.db.select().from(users).where(eq(users.id, id)).limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.databaseService.db.select().from(users).where(eq(users.email, email)).limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async create(data: NewUser): Promise<User | null> {
    const result = await this.databaseService.db.insert(users).values(data).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    const result = await this.databaseService.db.update(users).set(data).where(eq(users.id, id)).returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<User | null> {
    const result = await this.databaseService.db.delete(users).where(eq(users.id, id)).returning();

    return result.length > 0 ? result[0] : null;
  }
}
