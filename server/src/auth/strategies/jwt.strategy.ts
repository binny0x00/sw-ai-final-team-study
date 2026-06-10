import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

function fromCookie(req: Request) {
    return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    validate(payload: { sub: string; email: string }) {
        return { userId: payload.sub, email: payload.email };
    }
}