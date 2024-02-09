import { join } from 'node:path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { getMetadataArgsStorage } from 'typeorm';

export const entitiesPath = [join(__dirname, '../**/*.entity{.ts,.js}')];

export const dbConfig = (): PostgresConnectionOptions => {
  const config: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    schema: 'public',
    entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
    // We are using migrations, synchronize should be set to false.
    synchronize: false,
    dropSchema: false,
    // Run migrations automatically,
    // you can disable this if you prefer running migration manually.
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development',
  };

  return config;
};
