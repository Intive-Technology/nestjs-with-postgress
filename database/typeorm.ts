import { DataSource, DataSourceOptions } from 'typeorm';
import { dbConfig, entitiesPath } from '../src/config/typeorm';
import { resolve } from 'path';

const cliConfig = {
  migrationsDir: [resolve(__dirname, 'migrations/**/*{.ts,.js}')],
  entitiesDir: entitiesPath,
};

export const connectionSource = new DataSource({
  ...dbConfig(),
  migrations: [resolve(__dirname, 'migrations/**/*{.ts,.js}')],
  cli: cliConfig,
  seeds: [resolve(__dirname, 'seeders/**/*{.ts,.js}')],
  factories: [resolve(__dirname, 'factories/**/*{.ts,.js}')],
} as DataSourceOptions);
