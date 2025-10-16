import { AuthService } from './AuthService';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../grpc/mailGrpcClient';

jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock('../grpc/mailGrpcClient', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue({
    success: true,
    message: '',
    message_id: ''
  }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({
    success: true,
    message: '',
    message_id: ''
  })
}));

const mockedSendWelcomeEmail = sendWelcomeEmail as jest.MockedFunction<typeof sendWelcomeEmail>;
const getRepositoryMock = AppDataSource.getRepository as jest.Mock;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRepositoryMock.mockReset();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("enregistre un nouvel utilisateur et retourne un jeton", async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      save: jest.fn()
    };
    getRepositoryMock.mockReturnValue(repository);
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-secret');
    const createdUser = {
      email: 'test@example.com',
      password: 'hashed-secret',
      role: UserRole.USER
    } as unknown as User;
    repository.create.mockReturnValue(createdUser);
    const savedUser = {
      ...createdUser,
      id: 'user-id'
    } as unknown as User;
    repository.save.mockResolvedValue(savedUser);
    const service = new AuthService();
    const result = await service.register('test@example.com', 'password123');
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'hashed-secret',
        role: UserRole.USER
      })
    );
    expect(repository.save).toHaveBeenCalledWith(createdUser);
    expect(mockedSendWelcomeEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      user_name: 'test'
    });
    expect(result.user).toBe(savedUser);
    expect(typeof result.token).toBe('string');
  });

  it("refuse l'inscription si l'utilisateur existe déjà", async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue({ id: 'user-id' }),
      create: jest.fn(),
      save: jest.fn()
    };
    getRepositoryMock.mockReturnValue(repository);
    const service = new AuthService();
    await expect(service.register('test@example.com', 'password123')).rejects.toThrow('User already exists');
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('retourne un jeton lors de la connexion réussie sans 2FA', async () => {
    const user = new User();
    user.id = 'user-id';
    user.email = 'test@example.com';
    user.twoFactorEnabled = false;
    user.validatePassword = jest.fn().mockResolvedValue(true) as unknown as typeof user.validatePassword;
    const repository = {
      findOne: jest.fn().mockResolvedValue(user)
    };
    getRepositoryMock.mockReturnValue(repository);
    const service = new AuthService();
    const result = await service.login('test@example.com', 'password123');
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(user.validatePassword).toHaveBeenCalledWith('password123');
    expect(result.user).toBe(user);
    expect(result.token).toEqual(expect.any(String));
    expect(result.requires2FA).toBeUndefined();
    expect(result.tempToken).toBeUndefined();
  });

  it('retourne un jeton temporaire lorsque la 2FA est activée', async () => {
    const user = new User();
    user.id = 'user-id';
    user.email = 'test@example.com';
    user.twoFactorEnabled = true;
    user.validatePassword = jest.fn().mockResolvedValue(true) as unknown as typeof user.validatePassword;
    const repository = {
      findOne: jest.fn().mockResolvedValue(user)
    };
    getRepositoryMock.mockReturnValue(repository);
    const service = new AuthService();
    const result = await service.login('test@example.com', 'password123');
    expect(result.user).toBe(user);
    expect(result.requires2FA).toBe(true);
    expect(result.tempToken).toEqual(expect.any(String));
    expect(result.token).toBeUndefined();
  });

  it('valide un jeton signé', () => {
    const repository = {
      findOne: jest.fn()
    };
    getRepositoryMock.mockReturnValue(repository);
    const service = new AuthService();
    const token = jwt.sign({ userId: 'user-id' }, 'test-secret');
    const payload = service.verifyToken(token);
    expect(payload).toEqual(expect.objectContaining({ userId: 'user-id' }));
  });

  it('rejette un jeton invalide', () => {
    const repository = {
      findOne: jest.fn()
    };
    getRepositoryMock.mockReturnValue(repository);
    const service = new AuthService();
    expect(() => service.verifyToken('invalid-token')).toThrow('Invalid token');
  });
});
