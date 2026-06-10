import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 이 Guard를 @UseGuards(JwtAuthGuard)로 붙이면 요청이 컨트롤러 함수에 도착하기 전에 JWT 검사를 먼저 합니다.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}