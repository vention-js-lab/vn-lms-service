import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './shared/configs/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<EnvConfig, true>);

  app.setGlobalPrefix('v1');

  const appPort = configService.get('APP_PORT', { infer: true });
  await app.listen(appPort, '0.0.0.0');
}
bootstrap();
