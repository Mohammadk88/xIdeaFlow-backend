import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('xIdeaFlow API')
    .setDescription('AI-powered content generation platform backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Services', 'AI services management')
    .addTag('Credits', 'Credit system and payments')
    .addTag('Subscriptions', 'Subscription plans and management')
    .addTag('AI Generation', 'AI content generation endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Run seeder in development
  if (process.env.NODE_ENV === 'development') {
    const seeder = app.get(SeederService);
    await seeder.seedDatabase();
  }

  const port = process.env.PORT || 4020;
  await app.listen(port);

  console.log(`🚀 xIdeaFlow Backend is running on: http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api`,
  );
}

void bootstrap();
