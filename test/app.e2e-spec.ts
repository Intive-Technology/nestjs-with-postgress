import { Test, TestingModule } from '@nestjs/testing';
import { DynamicModule, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { MockFactory } from './mocks/repository.mock';

jest.mock('@nestjs/typeorm', () => {
  const actual = jest.requireActual('@nestjs/typeorm');

  actual.TypeOrmModule.forRootAsync = (): DynamicModule => {
    return {
      module: actual.TypeOrmModule,
      providers: [],
      exports: [],
    };
  };

  return {
    __esModules: true,
    ...actual,
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: MockFactory.getMock(Repository<User>),
        },
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(MockFactory.getMock(Repository<User>))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
