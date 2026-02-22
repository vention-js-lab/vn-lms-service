import type { DatabaseService } from '#/modules/database/database.service';
import { invitesTable } from '#/modules/database/schema';
import type { InvitesTableType } from '#/shared/types';
import { InvitesRepository } from './invites.respository';

type DbMock = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  transaction: jest.Mock;
};

type UpdateInvitePatch = Partial<Omit<InvitesTableType, 'id' | 'token' | 'created_at'>>;
type TxMock = {
  select: jest.Mock;
  update: jest.Mock;
};

const makeDb = (): DbMock => ({
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  transaction: jest.fn(),
});

describe('InvitesRepository', () => {
  let db: DbMock;
  let repo: InvitesRepository;

  beforeEach(() => {
    db = makeDb();
    const databaseService = { db } as unknown as DatabaseService;
    repo = new InvitesRepository(databaseService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getAllInvites
  // ---------------------------------------------------------------------------

  it('gets all invites', async () => {
    const from = jest.fn().mockResolvedValue([{ id: 'id-1' }, { id: 'id-2' }]);
    db.select.mockReturnValue({ from });

    const result = await repo.getAllInvites();

    expect(db.select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(invitesTable);
    expect(result).toEqual([{ id: 'id-1' }, { id: 'id-2' }]);
  });

  it('gets all invites returns empty array when none', async () => {
    const from = jest.fn().mockResolvedValue([]);
    db.select.mockReturnValue({ from });

    const result = await repo.getAllInvites();

    expect(result).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // getInviteById
  // ---------------------------------------------------------------------------

  it('gets invite by id', async () => {
    const limit = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    const result = await repo.getInviteById('id-1');

    expect(db.select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(invitesTable);
    expect(where).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 'id-1' });
  });

  it('returns null when invite by id not found', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    const result = await repo.getInviteById('missing');

    expect(result).toBeNull();
  });

  it('getInviteById uses limit(1)', async () => {
    const limit = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    await repo.getInviteById('id-1');

    expect(limit).toHaveBeenCalledWith(1);
  });

  // ---------------------------------------------------------------------------
  // createInvite
  // ---------------------------------------------------------------------------

  it('creates invites with pre-hashed token', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1', token: 'hashed:plain' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    const result = await repo.createInvite({
      email: 'a@b.com',
      first_name: null,
      last_name: null,
      role: 'admin',
      token: 'hashed:plain',
      expires_at: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(db.insert).toHaveBeenCalledWith(invitesTable);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'hashed:plain',
        email: 'a@b.com',
      }),
    );
    expect(result).toEqual({ id: 'id-1', token: 'hashed:plain' });
  });

  it('creates invite sets null first/last name when undefined', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await repo.createInvite({
      email: 'a@b.com',
      // @ts-expect-error intentionally omitted
      first_name: undefined,
      // @ts-expect-error intentionally omitted
      last_name: undefined,
      role: 'student',
      token: 'hashed:plain',
      expires_at: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: null,
        last_name: null,
      }),
    );
  });

  it('createInvite returns whatever returning() yields (first row)', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1' }, { id: 'id-2' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    const result = await repo.createInvite({
      email: 'a@b.com',
      first_name: null,
      last_name: null,
      role: 'hr',
      token: 'hashed:plain',
      expires_at: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(result).toEqual({ id: 'id-1' });
  });

  it('createInvite propagates db error', async () => {
    const returning = jest.fn().mockRejectedValue(new Error('db failed'));
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await expect(
      repo.createInvite({
        email: 'a@b.com',
        first_name: null,
        last_name: null,
        role: 'admin',
        token: 'hashed:plain',
        expires_at: new Date('2030-01-01T00:00:00.000Z'),
      }),
    ).rejects.toThrow('db failed');
  });

  // ---------------------------------------------------------------------------
  // updateInvite
  // ---------------------------------------------------------------------------

  it('updates invite fields', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1', email: 'x@y.com' }]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch: UpdateInvitePatch = { email: 'x@y.com' };
    const result = await repo.updateInvite('id-1', patch);

    expect(db.update).toHaveBeenCalledWith(invitesTable);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ email: 'x@y.com' }));
    expect(result).toEqual({ id: 'id-1', email: 'x@y.com' });
  });

  it('returns null when update affects no rows', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch: UpdateInvitePatch = { email: 'x@y.com' };
    const result = await repo.updateInvite('id-1', patch);

    expect(result).toBeNull();
  });

  it('updateInvite propagates db error', async () => {
    const returning = jest.fn().mockRejectedValue(new Error('update failed'));
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch: UpdateInvitePatch = { email: 'x@y.com' };
    await expect(repo.updateInvite('id-1', patch)).rejects.toThrow('update failed');
  });

  // ---------------------------------------------------------------------------
  // getValidInviteByToken
  // ---------------------------------------------------------------------------

  it('finds valid invites by token hash', async () => {
    const limit = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    const result = await repo.getValidInviteByToken('hashed:plain');

    expect(db.select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(invitesTable);
    expect(where).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 'id-1' });
  });

  it('returns null when valid invite by token not found', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    const result = await repo.getValidInviteByToken('hashed:plain');

    expect(result).toBeNull();
  });

  it('getValidInviteByToken propagates db error', async () => {
    const limit = jest.fn().mockRejectedValue(new Error('select failed'));
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    db.select.mockReturnValue({ from });

    await expect(repo.getValidInviteByToken('hashed:plain')).rejects.toThrow('select failed');
  });

  // ---------------------------------------------------------------------------
  // revokeInvite
  // ---------------------------------------------------------------------------

  it('revokes invites', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const result = await repo.revokeInvite('id-1');

    expect(db.update).toHaveBeenCalledWith(invitesTable);
    expect(set).toHaveBeenCalledWith({ revoked_at: expect.any(Date) });
    expect(where).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'id-1' });
  });

  it('revokeInvite returns null when id not found', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const result = await repo.revokeInvite('missing');

    expect(result).toBeNull();
  });

  it('revokeInvite propagates db error', async () => {
    const returning = jest.fn().mockRejectedValue(new Error('revoke failed'));
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    await expect(repo.revokeInvite('id-1')).rejects.toThrow('revoke failed');
  });

  // ---------------------------------------------------------------------------
  // markInviteUsed
  // ---------------------------------------------------------------------------

  it('marks invites used when valid', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const result = await repo.markInviteUsed('id-1');

    expect(db.update).toHaveBeenCalledWith(invitesTable);
    expect(set).toHaveBeenCalledWith({ used_at: expect.any(Date) });
    expect(result).toEqual({ id: 'id-1' });
  });

  it('returns null when markInviteUsed affects no rows (already used/revoked/expired)', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const result = await repo.markInviteUsed('id-1');

    expect(result).toBeNull();
  });

  it('markInviteUsed propagates db error', async () => {
    const returning = jest.fn().mockRejectedValue(new Error('mark used failed'));
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    await expect(repo.markInviteUsed('id-1')).rejects.toThrow('mark used failed');
  });

  // ---------------------------------------------------------------------------
  // consumeInviteByToken
  // ---------------------------------------------------------------------------

  it('consumes invite by token hash transactionally', async () => {
    const txSelectLimit = jest.fn().mockResolvedValue([{ id: 'id-1', token: 'hashed:plain' }]);
    const txSelectWhere = jest.fn().mockReturnValue({ limit: txSelectLimit });
    const txSelectFrom = jest.fn().mockReturnValue({ where: txSelectWhere });

    const txUpdateReturning = jest.fn().mockResolvedValue([{ id: 'id-1', used_at: new Date('2030-01-02T00:00:00.000Z') }]);
    const txUpdateWhere = jest.fn().mockReturnValue({ returning: txUpdateReturning });
    const txUpdateSet = jest.fn().mockReturnValue({ where: txUpdateWhere });

    const tx: TxMock = {
      select: jest.fn().mockReturnValue({ from: txSelectFrom }),
      update: jest.fn().mockReturnValue({ set: txUpdateSet }),
    };

    db.transaction.mockImplementation((fn: (client: TxMock) => Promise<unknown>) => fn(tx));

    const result = await repo.consumeInviteByToken('hashed:plain');

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(tx.select).toHaveBeenCalledTimes(1);
    expect(tx.update).toHaveBeenCalledWith(invitesTable);
    expect(txUpdateSet).toHaveBeenCalledWith({ used_at: expect.any(Date) });
    expect(result).toEqual({
      id: 'id-1',
      used_at: new Date('2030-01-02T00:00:00.000Z'),
    });
  });

  it('returns null when consume does not find invite', async () => {
    const txSelectLimit = jest.fn().mockResolvedValue([]);
    const txSelectWhere = jest.fn().mockReturnValue({ limit: txSelectLimit });
    const txSelectFrom = jest.fn().mockReturnValue({ where: txSelectWhere });

    const tx: TxMock = {
      select: jest.fn().mockReturnValue({ from: txSelectFrom }),
      update: jest.fn(),
    };

    db.transaction.mockImplementation((fn: (client: TxMock) => Promise<unknown>) => fn(tx));

    const result = await repo.consumeInviteByToken('hashed:plain');

    expect(result).toBeNull();
    expect(tx.update).not.toHaveBeenCalled();
  });

  it('returns null when consume finds invite but update returns empty (race condition)', async () => {
    const txSelectLimit = jest.fn().mockResolvedValue([{ id: 'id-1' }]);
    const txSelectWhere = jest.fn().mockReturnValue({ limit: txSelectLimit });
    const txSelectFrom = jest.fn().mockReturnValue({ where: txSelectWhere });

    const txUpdateReturning = jest.fn().mockResolvedValue([]); // update didn't affect row
    const txUpdateWhere = jest.fn().mockReturnValue({ returning: txUpdateReturning });
    const txUpdateSet = jest.fn().mockReturnValue({ where: txUpdateWhere });

    const tx: TxMock = {
      select: jest.fn().mockReturnValue({ from: txSelectFrom }),
      update: jest.fn().mockReturnValue({ set: txUpdateSet }),
    };

    db.transaction.mockImplementation((fn: (client: TxMock) => Promise<unknown>) => fn(tx));

    const result = await repo.consumeInviteByToken('hashed:plain');

    expect(result).toBeNull();
    expect(tx.update).toHaveBeenCalledWith(invitesTable);
  });

  it('consumeInviteByToken propagates transaction error', async () => {
    db.transaction.mockRejectedValue(new Error('tx failed'));

    await expect(repo.consumeInviteByToken('hashed:plain')).rejects.toThrow('tx failed');
  });

  it('consumeInviteByToken propagates error inside transaction callback', async () => {
    db.transaction.mockImplementation(() => {
      throw new Error('callback failed');
    });

    await expect(repo.consumeInviteByToken('hashed:plain')).rejects.toThrow('callback failed');
  });
});
