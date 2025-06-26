import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SeederService } from './src/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);
  await seederService.seedDatabase();
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
