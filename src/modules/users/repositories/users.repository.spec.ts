import { Test } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '#/modules/database/database.service';
import { type User, users } from '../entities';
import { UsersRepository } from './users.repository';

jest.mock('drizzle-orm', () => {
  const originalModule = jest.requireActual<typeof import('drizzle-orm')>('drizzle-orm');

  return {
    ...originalModule,
    eq: jest.fn(),
  };
});

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'hashed_password',
  role: 'student',
  status: 'active',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const createSelectChain = (result: User[]) => ({
  from: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue(result),
    }),
  }),
});

const createInsertChain = (result: User[]) => ({
  values: jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue(result),
  }),
});

const createUpdateChain = (result: User[]) => ({
  set: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(result),
    }),
  }),
});

const createDeleteChain = (result: User[]) => ({
  where: jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue(result),
  }),
});

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let dbMock: Record<'select' | 'insert' | 'update' | 'delete', jest.Mock>;

  beforeEach(async () => {
    dbMock = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DatabaseService,
          useValue: { db: dbMock },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const mockUser = createMockUser();
      dbMock.select.mockReturnValue(createSelectChain([mockUser]));

      const result = await repository.findById(mockUser.id);

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(eq).toHaveBeenCalledWith(users.id, mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('returns null when the user does not exist', async () => {
      dbMock.select.mockReturnValue(createSelectChain([]));

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      const mockUser = createMockUser();
      dbMock.select.mockReturnValue(createSelectChain([mockUser]));

      const result = await repository.findByEmail(mockUser.email);

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(eq).toHaveBeenCalledWith(users.email, mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('returns null when the email does not exist', async () => {
      dbMock.select.mockReturnValue(createSelectChain([]));

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns the new user', async () => {
      const mockUser = createMockUser();
      const createData = {
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: mockUser.password,
        role: mockUser.role,
        status: mockUser.status,
      } as const;

      dbMock.insert.mockReturnValue(createInsertChain([mockUser]));

      const result = await repository.create(createData);

      expect(dbMock.insert).toHaveBeenCalledWith(users);
      expect(result).toEqual(mockUser);
    });

    it('returns null when insert yields no rows', async () => {
      dbMock.insert.mockReturnValue(createInsertChain([]));

      const result = await repository.create({
        email: 'fail@example.com',
        firstName: 'Fail',
        lastName: 'Case',
        password: 'hashed',
        role: 'student',
        status: 'active',
      });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and returns the updated user', async () => {
      const mockUser = createMockUser();
      const updatedUser = createMockUser({ firstName: 'Updated' });
      dbMock.update.mockReturnValue(createUpdateChain([updatedUser]));

      const result = await repository.update(mockUser.id, { id: mockUser.id, firstName: 'Updated' });

      expect(dbMock.update).toHaveBeenCalledWith(users);
      expect(eq).toHaveBeenCalledWith(users.id, mockUser.id);
      expect(result).toEqual(updatedUser);
    });

    it('updates user status', async () => {
      const mockUser = createMockUser();
      const disabledUser = createMockUser({ status: 'disabled' });
      dbMock.update.mockReturnValue(createUpdateChain([disabledUser]));

      const result = await repository.update(mockUser.id, { id: mockUser.id, status: 'disabled' });

      expect(result?.status).toBe('disabled');
    });

    it('updates user role', async () => {
      const mockUser = createMockUser();
      const instructorUser = createMockUser({ role: 'instructor' });
      dbMock.update.mockReturnValue(createUpdateChain([instructorUser]));

      const result = await repository.update(mockUser.id, { id: mockUser.id, role: 'instructor' });

      expect(result?.role).toBe('instructor');
    });

    it('returns null when updating a non-existent user', async () => {
      dbMock.update.mockReturnValue(createUpdateChain([]));

      const result = await repository.update('non-existent-id', { id: 'non-existent-id', firstName: 'Ghost' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes and returns the deleted user', async () => {
      const mockUser = createMockUser();
      dbMock.delete.mockReturnValue(createDeleteChain([mockUser]));

      const result = await repository.delete(mockUser.id);

      expect(dbMock.delete).toHaveBeenCalledWith(users);
      expect(eq).toHaveBeenCalledWith(users.id, mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('returns null when deleting a non-existent user', async () => {
      dbMock.delete.mockReturnValue(createDeleteChain([]));

      const result = await repository.delete('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
