import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { MockFactory, MockType } from './mocks/repository.mock';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { CredentialDto } from '../src/auth/dto/credentials.dto';
import { cryptoHelper } from '../src/utils/crypto';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../src/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: MockType<Repository<User>>;

  const userData: CreateUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '123@abc',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(MockFactory.getMock(Repository<User>))
      .compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<MockType<Repository<User>>>(
      getRepositoryToken(User),
    );
    await app.init();
  });

  it('/auth/register (POST) Failed with 400 error', () => {
    const user = { ...userData };
    Reflect.deleteProperty(user, 'password');
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(400);
  });

  it('/auth/register (POST) Failed with 500 error', () => {
    userRepository.save?.mockImplementationOnce(() => Promise.reject('Error!'));
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(500);
  });

  it('/auth/register (POST) Success', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201)
      .expect((res) => expect(res.body).toHaveProperty('message'));
  });

  // @TODO: ValidationPipe not working with login
  // https://github.com/nestjs/nest/issues/767
  //   it('/auth/login (POST) Faield with 400 error', () => {
  //     const credentials = {
  //       email: userData.email,
  //     };
  //     return request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(credentials)
  //       .expect(400);
  //   });

  it('/auth/login (POST) Faield with 401 error', () => {
    const credentials = {
      email: userData.email,
      password: '123',
    };
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(401);
  });

  it('/auth/login (POST) Success', async () => {
    const credentials: CredentialDto = {
      email: userData.email,
      password: userData.password,
    };
    const user = { ...userData };
    user.password = await cryptoHelper.hash(
      userData.password,
      cryptoHelper.generateSalt(),
    );
    userRepository.findOne?.mockImplementation(() =>
      Promise.resolve({ id: 1, ...user }),
    );
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200)
      .expect((res) => expect(res.body).toHaveProperty('token'));
  });
});
