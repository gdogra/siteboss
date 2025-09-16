import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

type Env = 'development' | 'test' | 'production';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().positive().default(3001),

  // Database
  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  DB_NAME: Joi.string().default('siteboss'),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().allow('').default('password'),
  DB_SSL: Joi.boolean().default(false),
  DB_MAX_CONNECTIONS: Joi.number().integer().min(1).max(100).default(20),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Security
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  SESSION_SECRET: Joi.string().min(32).optional(),
  TRUSTED_PROXIES: Joi.string().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().integer().default(100),

  // CORS
  CORS_ORIGINS: Joi.string()
    .description('Comma-separated list of allowed CORS origins')
    .default('http://localhost:3000,http://localhost:3001,http://localhost:8088,http://localhost:8089,http://localhost'),

  // Redis (optional for session storage and caching)
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // Email
  SMTP_HOST: Joi.string().hostname().optional(),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASS: Joi.string().optional(),

  // File Upload
  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().integer().default(10 * 1024 * 1024), // 10MB
  
  // Supabase (Storage)
  SUPABASE_URL: Joi.string().uri().optional(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
  SUPABASE_BUCKET: Joi.string().default('documents'),
  
  // Monitoring
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  ENABLE_REQUEST_LOGGING: Joi.boolean().default(true),
  
  // Feature Flags
  ENABLE_SWAGGER: Joi.boolean().default(false),
  ENABLE_METRICS: Joi.boolean().default(true),
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const env = value as unknown as {
  NODE_ENV: Env;
  PORT: number;
  
  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SSL: boolean;
  DB_MAX_CONNECTIONS: number;
  
  // Auth
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET?: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Security
  BCRYPT_ROUNDS: number;
  SESSION_SECRET?: string;
  TRUSTED_PROXIES: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // CORS
  CORS_ORIGINS: string;
  
  // Redis
  REDIS_URL?: string;
  REDIS_PASSWORD?: string;
  
  // Email
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  
  // File Upload
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  
  // Monitoring
  LOG_LEVEL: string;
  ENABLE_REQUEST_LOGGING: boolean;
  
  // Feature Flags
  ENABLE_SWAGGER: boolean;
  ENABLE_METRICS: boolean;
};

export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
