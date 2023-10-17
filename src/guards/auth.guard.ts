import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { TokenService } from 'src/lib/token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization } = request.headers;
      const tokenArr = authorization.split(' ');
      const token = tokenArr[tokenArr.length - 1];

      // console.log(token);
      const decoded = await this.tokenService.validate(token);
      // console.log(decoded);
      request.user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
