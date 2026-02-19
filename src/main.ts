import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '#/app.module';
import { type EnvConfig } from '#/shared/configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<EnvConfig, true>);

  const appPort = configService.get('APP_PORT', { infer: true });
  await app.listen(appPort, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${appPort}`);
  });
}

void bootstrap();
