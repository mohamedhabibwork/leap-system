import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/users.service';
import { createUserFactory } from '../../factories/user.factory';
import { faker } from '@faker-js/faker';

describe('UsersService Integration Tests with Faker', () => {
  let service: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('should handle faker-generated user data', async () => {
      const mockUsers = Array.from({ length: 5 }, () => {
        const userData = createUserFactory();
        return {
          id: faker.number.int({ min: 1, max: 1000 }),
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      (service.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.findAll({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
    });
  });

  describe('findOne', () => {
    it('should return user with faker-generated data', async () => {
      const userData = createUserFactory();
      const mockUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (service.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(typeof result.email).toBe('string');
    });
  });

  describe('create', () => {
    it('should create user with faker-generated data', async () => {
      const userData = createUserFactory();
      const createdUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (service.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
    });
  });
});
