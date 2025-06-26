import { Module } from '@nestjs/common';
import { PaddleService } from './paddle.service';
import { PaddleController } from './paddle.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaddleService],
  controllers: [PaddleController],
  exports: [PaddleService],
})
export class PaddleModule {}
