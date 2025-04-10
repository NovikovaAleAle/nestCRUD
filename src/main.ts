import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { configSwagger, optionsSwagger } from './config/swagger.config';
import { parseIntEnv } from './helpers/parse.env.helper';
import { Env } from './config/constants';

async function bootstrap() {
  try {
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        prefix: 'nestCRUD',
        logLevels: ['log', 'warn', 'error'],
        timestamp: true,
      }),
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const documentFactory = () =>
      SwaggerModule.createDocument(app, configSwagger, optionsSwagger);
    SwaggerModule.setup('swagger', app, documentFactory, {
      jsonDocumentUrl: 'swagger/json',
    });

    await app.listen(parseIntEnv(Env.PORT));
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Uncaught error during application startup:', error);
});
