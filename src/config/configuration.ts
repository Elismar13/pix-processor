import databaseConfig from './database.config';
import redisConfig from './redis.config';

export default () => ({
  // Application
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Database
  database: databaseConfig(),

  // Redis
  redis: redisConfig(),
});
