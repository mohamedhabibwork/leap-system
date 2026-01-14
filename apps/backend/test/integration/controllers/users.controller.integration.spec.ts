import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { createUserFactory, createUsersFactory } from '../../factories/user.factory';
import { faker } from '@faker-js/faker';

describe('UsersController Integration Tests with Faker', () => {
  let controller: UsersController;
  let service: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('should return users with faker-generated data', async () => {
      const mockUsers = createUsersFactory(5).map((userData, index) => ({
        id: faker.number.int({ min: 1, max: 1000 }) + index,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (service.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await controller.findAll({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return user by ID with faker-generated data', async () => {
      const userData = createUserFactory();
      const mockUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (service.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
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

      const result = await controller.create(userData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(service.create).toHaveBeenCalledWith(userData);
    });
  });
});
