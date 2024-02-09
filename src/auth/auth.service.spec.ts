import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { pbkdf2Sync } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const users: User[] = Array.from({ length: 5 }, () => ({
    id: faker.number.int(10000),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    isActive: faker.datatype.boolean(1),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
      ],
      imports: [
        JwtModule.register({
          global: true,
          secret: 'This is my top secrets',
          signOptions: {
            expiresIn: '3600s',
          },
        }),
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should generate correct accesstoken for user', async () => {
    const [user] = users;
    const result = await service.login(user);
    const payload = await jwtService.verifyAsync(result, {
      secret: 'This is my top secrets',
    });
    expect(payload.sub).toEqual(user.id);
    expect(payload.email).toEqual(user.email);
  });

  it('Should register success', async () => {
    const [, , user] = users;
    const userDetails: CreateUserDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: 'MyTopSecretPassword',
    };
    const createSpy = jest
      .spyOn(userRepository, 'save')
      .mockResolvedValueOnce(user);

    const result = await service.register(userDetails);

    expect(createSpy).toBeCalledTimes(1);

    const [passedArg] = createSpy.mock.lastCall!;
    const [passwordHash, salt] = passedArg.password!.split('.');
    const password = pbkdf2Sync(
      userDetails.password,
      salt,
      100,
      64,
      'sha512',
    ).toString('hex');
    expect(password).toEqual(passwordHash);

    expect(result.status).toEqual(201);
  });

  it('Should register fail', async () => {
    const [, , , user] = users;
    const userDetails: CreateUserDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: 'MyTopSecretPassword',
    };
    const createSpy = jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue(new Error());
    const result = await service.register(userDetails);
    expect(createSpy).toBeCalledTimes(1);
    expect(result.status).toEqual(500);
  });
});
