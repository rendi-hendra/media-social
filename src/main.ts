import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

async function bootstrap(config: ConfigService) {
  const app = await NestFactory.create(AppModule, { cors: true });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  await app.listen(config.get('PORT'));
}
const configService = new ConfigService();
bootstrap(configService);
