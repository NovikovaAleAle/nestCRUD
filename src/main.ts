import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        prefix: 'nestCURD',
        logLevels: ['log', 'warn', 'error'],
        timestamp: true,
      }),
    });
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Uncaught error during application startup:', error);
});
