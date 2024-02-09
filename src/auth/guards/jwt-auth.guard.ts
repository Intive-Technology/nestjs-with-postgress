import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtGrpcGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'rpc') {
      return this.handleGrpcReq(context);
    }
    return false;
  }

  private extractTokenFromHeader(header: string | null) {
    const [type, token] = (header && header.split(' ')) ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('Invalid User!');
  }

  async handleGrpcReq(context: ExecutionContext) {
    const request = context.switchToRpc().getContext();
    const metadata = context.getArgByIndex(1);
    if (!metadata) {
      return false;
    }
    const prefix = 'Bearer ';

    const header = metadata.get('Authorization')[0];

    if (!header || !header.includes(prefix)) {
      return false;
    }

    const token = this.extractTokenFromHeader(header);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: 'This is my top secrets',
      });
      request.user = await this.validate(payload);
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
