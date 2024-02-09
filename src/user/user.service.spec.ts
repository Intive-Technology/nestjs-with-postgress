import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

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
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    const [user] = users;
    user.password = 'randomstring';

    const userDetails: CreateUserDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    };
    const createSpy = jest
      .spyOn(userRepository, 'save')
      .mockResolvedValueOnce(user);
    expect(await service.create(userDetails)).toEqual(user);
    expect(createSpy).toBeCalledTimes(1);
  });

  it('should find one user', async () => {
    const [, user] = users;
    const findOneBySpy = jest
      .spyOn(userRepository, 'findOneBy')
      .mockResolvedValueOnce(user);
    const result = await service.findOne(user.id);
    expect(result).toEqual(user);
    expect(result).not.toHaveProperty('password');
    expect(findOneBySpy).toBeCalledTimes(1);
  });

  it('should find user with password', async () => {
    const [, , user] = users;
    user.password = 'RandomString';
    const findOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValueOnce(user);
    const result = await service.findByEmailForAuth(user.email);
    expect(result).toEqual(user);
    expect(result).toHaveProperty('password');
    expect(findOneSpy).toBeCalledTimes(1);
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
    const result = await service.update(user.id, updateData);
    expect(result).toEqual(updatedUser);
    expect(findOneSpy).toBeCalledWith({ id: user.id });
    expect(findOneSpy).toBeCalledTimes(1);
    expect(mergeSpy).toBeCalledWith(user, updateData);
    expect(mergeSpy).toBeCalledTimes(1);
  });

  it('should return null when user not exist while update', async () => {
    const findOneSpy = jest
      .spyOn(userRepository, 'findOneBy')
      .mockResolvedValueOnce(null);

    const result = await service.update(1001, {});
    expect(result).toEqual(null);
    expect(findOneSpy).toBeCalledTimes(1);
    expect(findOneSpy).toBeCalledWith({ id: 1001 });
  });

  it('should remove user', async () => {
    const [, , , , user] = users;
    const deleteSpy = jest
      .spyOn(userRepository, 'delete')
      .mockResolvedValueOnce({} as DeleteResult);
    await service.remove(user.id);
    expect(deleteSpy).toBeCalledWith(user.id);
    expect(deleteSpy).toBeCalledTimes(1);
  });

  it('should find all users', async () => {
    const findAllSpy = jest
      .spyOn(userRepository, 'find')
      .mockResolvedValueOnce(users);
    expect(await service.findAll()).toEqual(users);
    expect(findAllSpy).toBeCalledTimes(1);
  });
});
