import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { LocalStategy } from './local.auth.strategy';
import { faker } from '@faker-js/faker';
import { User } from '../../user/entities/user.entity';
import { cryptoHelper } from '../../utils/crypto';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStategy', () => {
  let localStrategy: LocalStategy;
  let userService: UserService;

  const password = 'mysecretPassword';
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStategy,
        {
          provide: UserService,
          useValue: {
            findByEmailForAuth: jest.fn(),
          },
        },
      ],
      imports: [],
    }).compile();

    user = {
      id: faker.number.int(10000),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      isActive: faker.datatype.boolean(1),
      password: await cryptoHelper.hash(password, cryptoHelper.generateSalt()),
    };

    localStrategy = module.get(LocalStategy);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('Should validate user with valid credentials', async () => {
    const findSpy = jest
      .spyOn(userService, 'findByEmailForAuth')
      .mockResolvedValueOnce(user);

    const result = await localStrategy.validate(user.email, password);

    expect(findSpy).toBeCalledTimes(1);
    expect(findSpy).toBeCalledWith(user.email);
    expect(result).not.toHaveProperty('password');
    expect(result.id).toEqual(user.id);
    expect(result.email).toEqual(user.email);
  });

  it('Should invalidate user with invalid credentials', async () => {
    const findSpy = jest
      .spyOn(userService, 'findByEmailForAuth')
      .mockResolvedValueOnce(user);

    expect(async () => {
      await localStrategy.validate(user.email, 'notMyPassword');
    }).rejects.toThrow(UnauthorizedException);
    expect(findSpy).toBeCalledTimes(1);
    expect(findSpy).toBeCalledWith(user.email);
  });

  it('Should invalidate user with invalid credentials', async () => {
    const findSpy = jest
      .spyOn(userService, 'findByEmailForAuth')
      .mockResolvedValueOnce(null);

    expect(async () => {
      await localStrategy.validate(user.email, 'notMyPassword');
    }).rejects.toThrow(UnauthorizedException);
    expect(findSpy).toBeCalledTimes(1);
    expect(findSpy).toBeCalledWith(user.email);
  });
});
