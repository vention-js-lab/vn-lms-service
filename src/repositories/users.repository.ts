import { Injectable } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { DatabaseService } from '#/modules/database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // =============== Read ===============

  async findAll(): Promise<Users[]> {
    return this.databaseService.users.findMany();
  }

  async findById(id: string): Promise<Users | null> {
    return this.databaseService.users.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.databaseService.users.findUnique({ where: { email } });
  }

  // =============== Write ===============

  async create(data: Prisma.UsersCreateInput): Promise<Users> {
    return this.databaseService.users.create({ data });
  }

  async update(id: string, data: Prisma.UsersUpdateInput): Promise<Users> {
    return this.databaseService.users.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Users> {
    return this.databaseService.users.delete({ where: { id } });
  }
}
