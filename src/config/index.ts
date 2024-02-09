import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { dbConfig } from './typeorm';

interface iConfig {
  env: string;
  port: number;
  database: PostgresConnectionOptions;
  jwtSecret: string;
}

export default (): Partial<iConfig> => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'my top secret',
  database: dbConfig(),
});
