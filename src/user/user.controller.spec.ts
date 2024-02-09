import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userRepository: Repository<User>;

  const users: User[] = Array.from({ length: 5 }, () => ({
    id: faker.number.int(10000),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    isActive: faker.datatype.boolean(1),
  }));

  const resMock = {
    status: jest.fn(() => resMock),
    json: jest.fn(() => resMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
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

    controller = module.get<UserController>(UserController);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find user', async () => {
    expect(controller).toBeDefined();
    const [, user] = users;
    const findOneBySpy = jest
      .spyOn(userRepository, 'findOneBy')
      .mockResolvedValueOnce(user);

    await controller.findOne(`${user.id}`, resMock);

    expect(findOneBySpy).toBeCalledTimes(1);
    expect(resMock.status).toBeCalledWith(200);
    expect(resMock.json).toBeCalledWith(user);
  });

  it('should update user', async () => {
    const [, , , user] = users;
    const updateData: UpdateUserDto = {
      firstName: 'Jason',
      lastName: 'Millan',
    };
    const updatedUser: User = { ...user, ...updateData };

    const findOneSpy = jest
      .spyOn(userRepository, 'findOneBy')
      .mockResolvedValueOnce(user);
    const mergeSpy = jest
      .spyOn(userRepository, 'merge')
      .mockImplementationOnce(() => updatedUser);

    await controller.update(`${user.id}`, updateData, resMock);
    expect(findOneSpy).toBeCalledWith({ id: user.id });
    expect(findOneSpy).toBeCalledTimes(1);
    expect(mergeSpy).toBeCalledWith(user, updateData);
    expect(mergeSpy).toBeCalledTimes(1);
    expect(resMock.status).toBeCalledWith(200);
    expect(resMock.json).toBeCalledWith(updatedUser);
  });
});
