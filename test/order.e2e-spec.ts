import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrderModule } from '../src/order/order.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { MockFactory, MockType } from './mocks/repository.mock';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { UserService } from '../src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../src/config';

describe('OrderController (e2e)', () => {
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

  const orderService = { getOrders: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        OrderModule,
      ],
      providers: [
        JwtStrategy,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: MockFactory.getMock(Repository<User>),
        },
      ],
    })
      .overrideProvider('ORDER_SERVICE')
      .useValue({
        getService: () => orderService,
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

  it('/orders (POST) Failed with 401 error', () => {
    return request(app.getHttpServer()).post(`/orders`).expect(401);
  });

  it('/orders (POST) Failed with 400 error', () => {
    userRepository.findOneBy?.mockImplementationOnce(() =>
      Promise.resolve(user),
    );
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .post(`/orders`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(400);
  });

  it('/orders (POST) Success', () => {
    userRepository.findOneBy?.mockImplementationOnce(() =>
      Promise.resolve(user),
    );
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .post(`/orders`)
      .send({
        products: [
          {
            productId: '10001',
            price: 100,
            qty: 10,
          },
        ],
      })
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201);
  });

  it('/orders (GET) Failed with 401 error', () => {
    return request(app.getHttpServer()).get(`/orders`).expect(401);
  });

  it('/orders (GET) Success', () => {
    userRepository.findOneBy?.mockImplementationOnce(() =>
      Promise.resolve(user),
    );
    orderService.getOrders.mockImplementationOnce(() => of([]));
    const jwtToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return request(app.getHttpServer())
      .get(`/orders`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });
});
