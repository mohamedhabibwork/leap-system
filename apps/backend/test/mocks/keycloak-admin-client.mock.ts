// Mock for @keycloak/keycloak-admin-client to avoid ES module issues in Jest
export default class KcAdminClient {
  constructor(config?: any) {
    // Mock constructor
  }

  async auth() {
    return {
      grantManager: {
        obtainDirectly: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
      },
    };
  }

  users = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    update: jest.fn().mockResolvedValue({}),
    del: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  };

  roles = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    del: jest.fn().mockResolvedValue({}),
  };

  groups = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  };

  clients = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  };
}
