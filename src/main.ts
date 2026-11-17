import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // /api/v1/...

  // Глобальна валідація вхідних даних: зайві поля відкидаються, помилки повертаються з кодом 400
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, stopAtFirstError: true }));

  const swagger = new DocumentBuilder()
    .setTitle('Cyberpolice API')
    .setDescription('REST API інформаційно-аналітичної системи підрозділу кіберполіції (лабораторна робота №3)')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API:     http://localhost:${port}/api/v1/persons`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
