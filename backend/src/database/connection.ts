import { Pool, PoolConfig } from 'pg';
import { env } from '../config/env';
import { logger } from '../config/logger';

const dbConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: env.DB_MAX_CONNECTIONS,
  connectionTimeoutMillis: env.NODE_ENV === 'production' ? 5000 : 2000,
  idleTimeoutMillis: 30000,
  query_timeout: 30000,
  ssl: env.DB_SSL ? {
    rejectUnauthorized: false
  } : false,
  // Connection pool events
  application_name: 'siteboss-api',
};

export const pool = new Pool(dbConfig);

// Pool event handlers
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Database pool error', { error: err });
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

export const connectDB = async (): Promise<void> => {
  const maxAttempts = env.NODE_ENV === 'production' ? 10 : 30;
  const delayMs = env.NODE_ENV === 'production' ? 5000 : 2000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      logger.info('✅ Database connected successfully', {
        host: env.DB_HOST,
        database: env.DB_NAME,
        maxConnections: env.DB_MAX_CONNECTIONS,
        ssl: env.DB_SSL
      });
      client.release();
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ DB connection failed (attempt ${attempt}/${maxAttempts})`, {
        error: errorMessage,
        attempt,
        maxAttempts,
        host: env.DB_HOST,
        database: env.DB_NAME
      });
      
      if (attempt === maxAttempts) {
        logger.error('❌ Exhausted DB connection retries, exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', { error });
  }
};

export default pool;
