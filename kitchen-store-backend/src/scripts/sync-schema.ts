import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function syncSchema() {
  process.env.SCHEMA_SYNC = '1';

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  await dataSource.synchronize();
  await app.close();

  console.log('[schema] Database schema synchronized successfully');
}

void syncSchema().catch((error) => {
  console.error('[schema] Failed to synchronize schema:', error);
  process.exit(1);
});
