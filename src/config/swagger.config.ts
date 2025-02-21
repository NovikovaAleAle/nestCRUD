import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

export const configSwagger = new DocumentBuilder()
  .setTitle('Users CRUD')
  .setDescription('The users CRUD API description')
  .setVersion('1.0')
  .addTag('users')
  .build();

export const optionsSwagger: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};
