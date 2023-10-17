import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type Payload = {
  id: string;
  email: string;
};

type Token = string;

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async validate(token: string): Promise<Payload> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return decoded as Payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials. Please login!');
    }
  }

  async generate(payload: Payload, expires: number | string): Promise<Token> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: expires,
    });
    return token;
  }
}
