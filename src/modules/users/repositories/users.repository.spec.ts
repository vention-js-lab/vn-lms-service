import { type DatabaseService } from '#/modules/database/database.service';
import { UsersRepository } from './users.repository';

const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'asliddin.example@google.com',
  firstName: 'Asliddin',
  lastName: 'Tursunov',
  password: 'hashed_password',
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockUser2 = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  email: 'tursunov.example@example.com',
  firstName: 'Tursun',
  lastName: 'Asliddinov',
  password: 'hashed_password_2',
  role: 'INSTRUCTOR' as const,
  status: 'ACTIVE' as const,
  deletedAt: null,
  createdAt: new Date('2025-01-02'),
  updatedAt: new Date('2025-01-02'),
};

function createSelectChain(result: unknown) {
  const chain = {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(result),
      }),
    }),
  };

  chain.from.mockImplementation(() => {
    const fromResult = {
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(result),
      }),
    };

    return Object.assign(Promise.resolve(result), fromResult);
  });

  return chain;
}

function createInsertChain(result: unknown) {
  return {
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(result),
    }),
  };
}

function createUpdateChain(result: unknown) {
  return {
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function createDeleteChain(result: unknown) {
  return {
    where: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(result),
    }),
  };
}

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let dbMock: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    dbMock = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const databaseService = { db: dbMock } as unknown as DatabaseService;
    repository = new UsersRepository(databaseService);
  });

  // ============== findAll ==============

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser, mockUser2];
      dbMock.select.mockReturnValue(createSelectChain(users));

      const result = await repository.findAll();

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });

    it('should return an empty array when no users exist', async () => {
      dbMock.select.mockReturnValue(createSelectChain([]));

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  // ============== findById ==============

  describe('findById', () => {
    it('should return a user when found', async () => {
      dbMock.select.mockReturnValue(createSelectChain([mockUser]));

      const result = await repository.findById(mockUser.id);

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      dbMock.select.mockReturnValue(createSelectChain([]));

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  // ============== findByEmail ==============

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      dbMock.select.mockReturnValue(createSelectChain([mockUser]));

      const result = await repository.findByEmail(mockUser.email);

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when email is not found', async () => {
      dbMock.select.mockReturnValue(createSelectChain([]));

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  // ============== create ==============

  describe('create', () => {
    it('should create and return the new user', async () => {
      const newUserData = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'hashed_password',
      };

      dbMock.insert.mockReturnValue(createInsertChain([mockUser]));

      const result = await repository.create(newUserData);

      expect(dbMock.insert).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  // ============== update ==============

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      dbMock.update.mockReturnValue(createUpdateChain([updatedUser]));

      const result = await repository.update(mockUser.id, { firstName: 'Updated' });

      expect(dbMock.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should return undefined when updating a non-existent user', async () => {
      dbMock.update.mockReturnValue(createUpdateChain([]));

      const result = await repository.update('non-existent-id', { firstName: 'Ghost' });

      expect(result).toBeUndefined();
    });
  });

  // ============== delete ==============

  describe('delete', () => {
    it('should delete and return the deleted user', async () => {
      dbMock.delete.mockReturnValue(createDeleteChain([mockUser]));

      const result = await repository.delete(mockUser.id);

      expect(dbMock.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when deleting a non-existent user', async () => {
      dbMock.delete.mockReturnValue(createDeleteChain([]));

      const result = await repository.delete('non-existent-id');

      expect(result).toBeUndefined();
    });
  });
});
