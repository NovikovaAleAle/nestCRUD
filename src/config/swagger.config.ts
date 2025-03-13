import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

export const configSwagger = new DocumentBuilder()
  .setTitle('Users CRUD')
  .setDescription('The users CRUD API description')
  .setVersion('1.0')
  .addBasicAuth()
  .addSecurity('JwtBearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })
  .addTag('users')
  .build();

export const optionsSwagger: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};
