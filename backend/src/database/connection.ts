import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'siteboss',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
};

export const pool = new Pool(dbConfig);

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

export default pool;