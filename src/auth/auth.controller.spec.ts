import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;
  let authService: AuthService;
  let jwtService: JwtService;

  const resMock = {
    status: jest.fn(() => resMock),
    json: jest.fn(() => resMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
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
    controller = module.get<AuthController>(AuthController);
    userService = module.get(UserService);
    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('Should login user', async () => {
      const user = {
        id: faker.number.int(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const jwt = await jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValueOnce(jwt);
      await controller.login({ user }, resMock);
      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith(user);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({
        ...user,
        token: jwt,
      });
    });
  });

  describe('register', () => {
    it('Should register user', async () => {
      const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createSpy = jest
        .spyOn(userService, 'create')
        .mockImplementationOnce((data: CreateUserDto) =>
          Promise.resolve({
            ...data,
            id: faker.number.int(10000),
            isActive: faker.datatype.boolean(1),
          } as User),
        );

      await controller.register(user, resMock);
      expect(resMock.status).toHaveBeenCalledWith(201);
      expect(resMock.json).toHaveBeenCalledWith({
        message: 'new user is created successfully!',
      });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('Should failed user registration', async () => {
      const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createSpy = jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new Error('User already exist!'));

      await controller.register(user, resMock);
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.json).toHaveBeenCalledWith({ message: 'Error occured!' });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });
});
