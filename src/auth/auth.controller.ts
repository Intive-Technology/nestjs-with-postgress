import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, createUserSchema } from '../user/dto/create-user.dto';
import { CredentialDto, credentialSchema } from './dto/credentials.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../user/entities/user.entity';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: CredentialDto })
  @UsePipes(new ZodValidationPipe(credentialSchema))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request, @Res() res) {
    const user = request.user;
    const token = await this.authService.login(user as User);
    return res.status(200).json({ ...user, token });
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto,
    @Res() res,
  ) {
    const auth = await this.authService.register(body);
    return res.status(auth.status).json(auth.content);
  }
}
