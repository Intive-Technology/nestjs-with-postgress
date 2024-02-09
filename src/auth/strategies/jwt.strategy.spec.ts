import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { JwtStrategy } from './jwt.strategy';
import { faker } from '@faker-js/faker';
import { User } from '../../user/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import configuration from '../../config';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            global: true,
            secret: configService.get('jwtSecret'),
            signOptions: {
              expiresIn: '3600s',
            },
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    jwtStrategy = module.get(JwtStrategy);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('Should get user with valid user payload', async () => {
    const user: User = {
      id: faker.number.int(10000),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      isActive: faker.datatype.boolean(1),
    };

    const findSpy = jest
      .spyOn(userService, 'findOne')
      .mockResolvedValueOnce(user);

    const result = await jwtStrategy.validate({
      sub: user.id,
      email: user.email,
    });

    expect(findSpy).toBeCalledTimes(1);
    expect(findSpy).toBeCalledWith(user.id);
    expect(result).toEqual(user);
  });

  it('Should throw error for invalidate user payload', async () => {
    const findSpy = jest
      .spyOn(userService, 'findOne')
      .mockResolvedValueOnce(null);

    expect(async () => {
      await jwtStrategy.validate({ sub: 1001, email: 'abc@xyz.com' });
    }).rejects.toThrow(UnauthorizedException);
    expect(findSpy).toBeCalledTimes(1);
    expect(findSpy).toBeCalledWith(1001);
  });
});
