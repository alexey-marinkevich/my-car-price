import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create instance of an auth service', async () => {
    expect(service).toBeDefined();
  });
  it('creates a new user with hashed password', async () => {
    const requestBody = {
      email: 'test@test.com',
      password: 'test',
    };

    const user = await service.signUp(requestBody);
    expect(user.password).not.toEqual(requestBody.password);
  });

  it('throws an error if user signs up with email that is in use', async () => {
    const requestBody = {
      email: 'a',
      password: '1',
    };

    await service.signUp(requestBody);

    await expect(service.signUp(requestBody)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if sign in is called with an unused email', async () => {
    const requestBody = {
      email: 'test@test.com',
      password: 'test',
    };

    await expect(service.signIn(requestBody)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    const user = {
      email: 'test@test.com',
      password: 'test',
    };

    const requestBody = {
      email: 'test@test.com',
      password: 'testtest',
    };

    await service.signUp(user);

    await expect(service.signIn(requestBody)).rejects.toThrow(
      BadRequestException,
    );
  });
});
