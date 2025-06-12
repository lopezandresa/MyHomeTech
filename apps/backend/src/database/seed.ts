import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { seedAppliances } from './seed-appliances';
import { seedApplianceStructure } from './seed-appliance-structure';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Starting seeding...');
  
  try {
    // First seed the new structured appliance data
    await seedApplianceStructure(dataSource);
    
    // Then seed the old appliances (if still needed)
    await seedAppliances(dataSource);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
