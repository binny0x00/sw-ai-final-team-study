import { Injectable, ConflictException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async register(dto: RegisterDto, res: Response) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('이미 가입된 이메일입니다.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);   // saltOrRounds : 암호화 강도

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                passwordHash,
            },
        });

        // 회원가입 성공 후 바로 로그인
        this.setCookie(res, user);

        return this.safeUser(user);
    }

    async login(dto: LoginDto, res: Response) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const isPasswordOk = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordOk) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 로그인 성공 시 JWT 쿠키 저장
        this.setCookie(res, user);

        return this.safeUser(user);
    }

    async me(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new UnauthorizedException();
        }

        return this.safeUser(user);
    }

    logout(res: Response) {
        // 브라우저에 저장된 access_token 쿠키 삭제
        res.clearCookie('access_token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });

        return { ok: true };
    }

    private setCookie(res: Response, user: User) {
        const token = this.jwt.sign({ sub: user.id, email: user.email });

        res.cookie('access_token', token, {
            // JavaScript에서 쿠키를 직접 읽지 못하게 합니다.
            httpOnly: true,

            // 같은 사이트 또는 일반적인 이동 요청에서는 쿠키를 보냅니다.
            sameSite: 'lax',

            // 로컬 개발 환경은 http이므로 false입니다.
            // 실제 배포에서 https를 쓰면 true로 바꿉니다.
            secure: false,

            // 사이트 전체 경로에서 쿠키를 사용할 수 있게 합니다.
            path: '/',

            // 쿠키 유지 시간입니다. 24시간입니다.
            maxAge: 1000 * 60 * 60 * 24,
        });
    }

    // 프론트엔드로 보내도 되는 사용자 정보
    private safeUser(user: User) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }
}
