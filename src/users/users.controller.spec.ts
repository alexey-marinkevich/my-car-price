import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  const userObj = {
    email: 'test@gmail.com',
    password: 'test',
  };

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'alskd@gamil.com',
          password: 'test',
        } as User);
      },

      findByEmail: (email: string) => {
        return Promise.resolve([
          {
            id: 12,
            email,
            password: 'test',
          } as User,
        ]);
      },
    };

    fakeAuthService = {
      signIn: (userObj) => {
        return Promise.resolve({
          id: 3,
          email: userObj.email,
          password: userObj.password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('throws an error if user not found with given userId', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('3')).rejects.toThrow(NotFoundException);
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('3');
    expect(user).toBeDefined;
  });

  it('expects user with the given email to be found', async () => {
    const user = await controller.findByEmail('test@gmail.com');
    expect(user).toBeDefined;
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: 0 };
    const user = await controller.signIn(userObj, session);
    expect(user.id).toEqual(3);
    expect(session.userId).toEqual(user.id);
  });
});
