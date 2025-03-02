import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { CloudinaryService } from './cloudinary.service';
import { CaslAbilityFactory } from './ability.factory';
import { JwtGuard } from './jwt.guard';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    CloudinaryService,
    CaslAbilityFactory,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [
    PrismaService,
    ValidationService,
    CloudinaryService,
    CaslAbilityFactory,
  ],
})
export class CommonModule {}
