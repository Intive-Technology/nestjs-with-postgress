import { createUserSchema } from './create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const updateUserSchema = createUserSchema
  .omit({ email: true, password: true })
  .partial()
  .strict();

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
