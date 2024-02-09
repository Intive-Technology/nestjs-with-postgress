import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { CreateOrderDto } from './dto/create-order.dto';
describe('OrderAppController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const user: User = {
    id: faker.number.int(10000),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    isActive: faker.datatype.boolean(1),
  };

  const reqMock = {
    user,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
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

    orderController = app.get<OrderController>(OrderController);
    orderService = app.get<OrderService>(OrderService);
  });

  describe('root', () => {
    it('should defined controller', () => {
      expect(orderController).toBeDefined();
    });

    it('it should create order with REST', async () => {
      const body: CreateOrderDto = {
        products: [
          {
            productId: '10001',
            price: 100,
            qty: 10,
          },
        ],
      };
      const result = await orderController.createOrder(reqMock, body);
      expect(result).toHaveProperty('orderId');
    });

    it('it should get order', async () => {
      const orderServiceSpy = jest.spyOn(orderService, 'getOrders');
      const body = {
        products: [
          {
            productId: '10001',
            qty: 10,
            price: 5,
          },
        ],
      };
      await orderController.createOrder(reqMock, body);

      const result = await orderController.getOrder(reqMock);
      expect(result).toHaveProperty('orders');
      expect(result.orders).toHaveLength(1);
      expect(orderServiceSpy).toHaveBeenCalled();
    });
  });
});
