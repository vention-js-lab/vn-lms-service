import { Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { DatabaseService } from '#/modules/database/database.service';
import { invitesTable, InvitesTableType } from '../entities/invites.entity';

@Injectable()
export class InvitesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllInvites() {
    return this.databaseService.db.select().from(invitesTable);
  }

  async getInviteById(id: string) {
    const rows = await this.databaseService.db.select().from(invitesTable).where(eq(invitesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async createInvite(inviteData: Omit<InvitesTableType, 'id' | 'created_at' | 'used_at' | 'revoked_at'>) {
    const [newInvite] = await this.databaseService.db
      .insert(invitesTable)
      .values({
        email: inviteData.email,
        first_name: inviteData.first_name ?? null,
        last_name: inviteData.last_name ?? null,
        role: inviteData.role,
        token: inviteData.token,
        expires_at: inviteData.expires_at,
        created_at: new Date(),
      })
      .returning();

    return newInvite;
  }
  async updateInvite(id: string, updateData: Partial<Omit<InvitesTableType, 'id' | 'created_at' | 'token'>>) {
    const patch: Partial<InvitesTableType> = { ...updateData };
    const [updatedInvite] = await this.databaseService.db
      .update(invitesTable)
      .set(patch)
      .where(eq(invitesTable.id, id))
      .returning();
    return updatedInvite ?? null;
  }

  async getValidInviteByToken(tokenHash: string) {
    const now = new Date();
    const rows = await this.databaseService.db
      .select()
      .from(invitesTable)
      .where(
        and(
          eq(invitesTable.token, tokenHash),
          isNull(invitesTable.used_at),
          isNull(invitesTable.revoked_at),
          gt(invitesTable.expires_at, now),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async revokeInvite(id: string) {
    const [revokedInvite] = await this.databaseService.db
      .update(invitesTable)
      .set({ revoked_at: new Date() })
      .where(eq(invitesTable.id, id))
      .returning();
    return revokedInvite ?? null;
  }

  async markInviteUsed(id: string) {
    const now = new Date();
    const [usedInvite] = await this.databaseService.db
      .update(invitesTable)
      .set({ used_at: now })
      .where(
        and(
          eq(invitesTable.id, id),
          isNull(invitesTable.used_at),
          isNull(invitesTable.revoked_at),
          gt(invitesTable.expires_at, now),
        ),
      )
      .returning();
    return usedInvite ?? null;
  }

  async consumeInviteByToken(tokenHash: string) {
    return this.databaseService.db.transaction(async (tx) => {
      const now = new Date();
      const found = await tx
        .select()
        .from(invitesTable)
        .where(
          and(
            eq(invitesTable.token, tokenHash),
            isNull(invitesTable.used_at),
            isNull(invitesTable.revoked_at),
            gt(invitesTable.expires_at, now),
          ),
        )
        .limit(1);
      const invite = found[0];
      if (!invite) return null;
      const updated = await tx
        .update(invitesTable)
        .set({ used_at: now })
        .where(
          and(
            eq(invitesTable.id, invite.id),
            isNull(invitesTable.used_at),
            isNull(invitesTable.revoked_at),
            gt(invitesTable.expires_at, now),
          ),
        )
        .returning();
      return updated[0] ?? null;
    });
  }
}
