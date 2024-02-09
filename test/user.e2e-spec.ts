import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { MockFactory, MockType } from './mocks/repository.mock';
import { UserModule } from '../src/user/user.module';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../src/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: MockType<Repository<User>>;
  let jwtService: JwtService;

  const user = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '123@abc',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
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
      providers: [JwtStrategy],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(MockFactory.getMock(Repository<User>))
      .compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<MockType<Repository<User>>>(
      getRepositoryToken(User),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  it('/user/:id (GET) Failed with 401 error', () => {
    return request(app.getHttpServer()).get(`/user/${user.id}`).expect(401);
  });

  it('/user/:id (GET) Success', () => {
    userRepository.findOneBy?.mockImplementationOnce(() =>
      Promise.resolve(user),
    );
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .get(`/user/${user.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });

  it('/user/:id (PATCH) Failed with 401 error', () => {
    return request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .send({
        firstName: 'James',
        lastName: 'Berry',
      })
      .expect(401);
  });

  it('/user/:id (PATCH) Failed with 400 error', () => {
    userRepository.findOneBy?.mockImplementationOnce(() =>
      Promise.resolve(user),
    );
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        unknown: 'never',
      })
      .expect(400);
  });

  it('/user/:id (PATCH) Success', () => {
    userRepository.findOneBy
      ?.mockImplementationOnce(() => Promise.resolve(user))
      .mockImplementationOnce(() => Promise.resolve(user));
    userRepository.merge?.mockImplementationOnce((data, args) =>
      Promise.resolve({ ...data, ...args }),
    );
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .patch(`/user/${user.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        firstName: 'James',
        lastName: 'Berry',
      })
      .expect(200)
      .expect((res) =>
        expect(res.body).toEqual({
          ...user,
          firstName: 'James',
          lastName: 'Berry',
        }),
      );
  });
});
