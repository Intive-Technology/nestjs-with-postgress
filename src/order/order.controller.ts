import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto, createOrderSchema } from './dto/create-order.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderAppService: OrderService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Req() req,
    @Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderDto,
  ) {
    const { user } = req;
    const orderId = await this.orderAppService.createOrder(body, user.id!);
    return { orderId };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrder(@Req() req) {
    const { user } = req;
    const orderRes = await this.orderAppService.getOrders(user.id!);
    return orderRes;
  }
}
