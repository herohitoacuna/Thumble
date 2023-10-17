import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from './auth.service';
import { CreateUserDto, LoginDto } from '../../dtos/User.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signUp')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.createUser(createUserDto);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 10);

    res.clearCookie('refresh_token');
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      expires: expirationDate,
    });
    return { accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 10);

    res.clearCookie('refresh_token');
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      expires: expirationDate,
    });
    return { accessToken };
  }

  @Get('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token } = req.cookies;

    if (!refresh_token)
      throw new NotFoundException('Token not found. Please login again.');

    const { accessToken, refreshToken } =
      await this.authService.getAccessTokenFromRefreshToken(refresh_token);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 10);

    res.clearCookie('refresh_token');
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      expires: expirationDate,
    });

    return { accessToken };
  }

  @Delete('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { httpOnly: true });
    return { status: 'Success' };
  }
}
