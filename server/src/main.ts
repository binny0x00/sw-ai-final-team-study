import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // req.cookies로 쿠키를 읽을 수 있게 설정
  app.use(cookieParser());

  // React 개발 서버에서 NestJS API를 호출할 수 있게 허용
  app.enableCors({
    // 허용할 프론트엔드 주소
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',

    // 쿠키를 주고 받기 위함
    credentials: true,
  });

  // 모든 API 요청에 DTO 유효성 검사를 적용
  app.useGlobalPipes(
      new ValidationPipe({
        // DTO에 없는 값은 제거
        whitelist: true,

        // DTO에 없는 값이 들어오면 에러 처리
        forbidNonWhitelisted: true,

        // 요청 데이터를 DTO 타입으로 변환
        transform: true,
      }),
  );

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
