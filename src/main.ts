import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { configSwagger, optionsSwagger } from './config/swagger.config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        prefix: 'nestCRUD',
        logLevels: ['log', 'warn', 'error'],
        timestamp: true,
      }),
    });

    const documentFactory = () =>
      SwaggerModule.createDocument(app, configSwagger, optionsSwagger);
    SwaggerModule.setup('swagger', app, documentFactory, {
      jsonDocumentUrl: 'swagger/json',
    });

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Uncaught error during application startup:', error);
});
