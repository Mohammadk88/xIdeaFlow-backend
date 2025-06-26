import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { CreditsModule } from './credits/credits.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AiServicesModule } from './ai-services/ai-services.module';
import { SeederModule } from './seeder/seeder.module';
import { PaddleModule } from './paddle/paddle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    CreditsModule,
    SubscriptionsModule,
    AiServicesModule,
    SeederModule,
    PaddleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
