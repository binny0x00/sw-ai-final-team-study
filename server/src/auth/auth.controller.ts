import { Controller, Body, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

type AuthedRequest = Request & {
    user: { userId: string; email: string };
};

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.register(dto, res);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(dto, res);
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        return this.authService.logout(res);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: AuthedRequest) {
        return this.authService.me(req.user.userId);
    }
}
