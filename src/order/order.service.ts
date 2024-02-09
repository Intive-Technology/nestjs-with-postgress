import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

type Product = {
  productId: string;
  qty: number;
  price: number;
};

export type Order = {
  customerId: string;
  orderId: string;
  products: Array<Product>;
};

@Injectable()
export class OrderService {
  private orders: Order[] = [];

  async createOrder(data: CreateOrderDto, customerId: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `${1000 + this.orders.length}`;
        this.orders.push({
          ...(data as { products: Product[] }),
          orderId,
          customerId,
        });
        resolve(orderId);
      }, 1000);
    });
  }

  async getOrders(customerId: string): Promise<{ orders: Order[] }> {
    const wating = new Promise<{ orders: Order[] }>((resolve) => {
      setTimeout(() => {
        const result = this.orders.filter(
          (order) => order.customerId === customerId,
        );
        resolve({ orders: result });
      }, 1000);
    });

    return await wating;
  }
}
