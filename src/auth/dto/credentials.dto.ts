import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class CredentialDto extends createZodDto(credentialSchema) {}
