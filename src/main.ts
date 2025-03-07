import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

async function bootstrap(config: ConfigService) {
  const app = await NestFactory.create(AppModule, { cors: true });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const excludedRoutes = [
      '/api/users/login',
      '/api/users',
      '/',
      '/api/payment/midtrans',
    ]; // Login dan Register dikecualikan
    if (excludedRoutes.includes(req.path) && req.method === 'POST') {
      return next();
    }
    return csurf({ cookie: true })(req, res, next);
  });

  await app.listen(config.get('PORT'));
}
const configService = new ConfigService();
bootstrap(configService);
