import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const createOrderSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string(),
      qty: z.number(),
      price: z.number(),
    }),
  ),
});

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
