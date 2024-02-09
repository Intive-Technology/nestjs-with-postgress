import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { cryptoHelper } from '../utils/crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(user: User) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return token;
  }

  async register(data: CreateUserDto) {
    let isOk = true;
    const salt = cryptoHelper.generateSalt();
    const user: CreateUserDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await cryptoHelper.hash(data.password, salt),
    };

    await this.userService.create(user).catch(() => {
      isOk = false;
    });

    if (isOk) {
      return {
        status: 201,
        content: { message: 'new user is created successfully!' },
      };
    }

    return { status: 500, content: { message: 'Error occured!' } };
  }
}
