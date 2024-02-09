import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../../user/user.service';
import { cryptoHelper } from '../../utils/crypto';

@Injectable()
export class LocalStategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const userDetails = await this.userService.findByEmailForAuth(username);
    if (userDetails) {
      const result = await cryptoHelper.compare(
        password,
        userDetails.password!,
      );
      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = userDetails;
        return user;
      }
    }
    throw new UnauthorizedException('Invalid credentials!');
  }
}
