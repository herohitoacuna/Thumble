import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from 'src/schemas/User.schema';
import { CreateUserDto, LoginDto } from '../../dtos/User.dto';
import { Payload } from 'src/types/payload';
import { TokenService } from 'src/lib/token';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthenticationService {
  private readonly privateKey: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
  ) {}

  private async generateTokens(payload: Payload) {
    // this time is in seconds
    const accessTime = 60 * 10; // expires in 10mins
    const refreshTime = 60 * 60 * 24 * 10; // expires in 10days

    const accessToken = await this.tokenService.generate(payload, accessTime);
    const refreshToken = await this.tokenService.generate(payload, refreshTime);

    return { accessToken, refreshToken };
  }

  async createUser(createUserDto: CreateUserDto): Promise<AuthTokens> {
    const email = await this.userModel.findOne({ email: createUserDto.email });
    if (email)
      throw new HttpException('User is already Exist', HttpStatus.BAD_REQUEST);

    const user = await new this.userModel({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    }).save();

    return await this.generateTokens({ id: user.id, email: user.email });
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password.');

    return await this.generateTokens({ id: user.id, email: user.email });
  }

  async getAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<AuthTokens> {
    const decoded = await this.tokenService.validate(refreshToken);
    const user = await this.userModel.findById(decoded.id);

    if (!user) throw new UnauthorizedException('Invalid token.');

    return this.generateTokens({ id: user.id, email: user.email });
  }
}
