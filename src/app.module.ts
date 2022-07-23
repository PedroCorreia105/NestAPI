import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { LoggingInterceptor } from './common/logging.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewModule } from './review/review.module';
import { RoomModule } from './room/room.module';
import { ShopModule } from './shop/shop.module';
import { UserModule } from './user/user.module';

const validationPipeOptions = {
  enableDebugMessages: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  whitelist: true,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ReviewModule,
    RoomModule,
    ShopModule,
    UserModule,
    PrismaModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
