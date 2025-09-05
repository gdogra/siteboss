import { Pool } from 'pg';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../config/logger';
import pool from './connection';

interface Migration {
  id: string;
  filename: string;
  sql: string;
  checksum: string;
  executed_at?: Date;
}

export class MigrationManager {
  private pool: Pool;
  private migrationsPath: string;

  constructor(dbPool: Pool, migrationsPath: string = join(__dirname, 'migrations')) {
    this.pool = dbPool;
    this.migrationsPath = migrationsPath;
  }

  private async ensureMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
    `;

    try {
      await this.pool.query(createTableSQL);
      logger.info('Migrations table ensured');
    } catch (error) {
      logger.error('Failed to create migrations table', { error });
      throw error;
    }
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async getExecutedMigrations(): Promise<Set<string>> {
    try {
      const result = await this.pool.query(
        'SELECT filename FROM migrations ORDER BY id ASC'
      );
      return new Set(result.rows.map(row => row.filename));
    } catch (error) {
      logger.error('Failed to get executed migrations', { error });
      throw error;
    }
  }

  private async getMigrationFiles(): Promise<Migration[]> {
    try {
      const files = await readdir(this.migrationsPath);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ensure consistent ordering

      const migrations: Migration[] = [];

      for (const filename of migrationFiles) {
        const filePath = join(this.migrationsPath, filename);
        const sql = await readFile(filePath, 'utf-8');
        const checksum = this.calculateChecksum(sql);

        migrations.push({
          id: filename.replace('.sql', ''),
          filename,
          sql,
          checksum
        });
      }

      return migrations;
    } catch (error) {
      logger.error('Failed to read migration files', { error });
      throw error;
    }
  }

  private async executeMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Execute the migration
      await client.query(migration.sql);

      // Record the migration
      await client.query(
        'INSERT INTO migrations (filename, checksum) VALUES ($1, $2)',
        [migration.filename, migration.checksum]
      );

      await client.query('COMMIT');

      logger.info(`Migration executed successfully: ${migration.filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Migration failed: ${migration.filename}`, { error });
      throw error;
    } finally {
      client.release();
    }
  }

  private async validateMigration(migration: Migration): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'SELECT checksum FROM migrations WHERE filename = $1',
        [migration.filename]
      );

      if (result.rows.length === 0) {
        return true; // Migration hasn't been executed
      }

      const storedChecksum = result.rows[0].checksum;
      if (storedChecksum !== migration.checksum) {
        throw new Error(
          `Migration checksum mismatch for ${migration.filename}. ` +
          `Expected: ${migration.checksum}, Found: ${storedChecksum}`
        );
      }

      return false; // Migration already executed and validated
    } catch (error) {
      logger.error(`Migration validation failed: ${migration.filename}`, { error });
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      logger.info('Starting database migrations...');

      await this.ensureMigrationsTable();

      const allMigrations = await this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      logger.info(`Found ${allMigrations.length} migration files`);
      logger.info(`${executedMigrations.size} migrations already executed`);

      let executedCount = 0;

      for (const migration of allMigrations) {
        if (await this.validateMigration(migration)) {
          await this.executeMigration(migration);
          executedCount++;
        }
      }

      if (executedCount === 0) {
        logger.info('No new migrations to execute');
      } else {
        logger.info(`Successfully executed ${executedCount} migrations`);
      }

    } catch (error) {
      logger.error('Migration process failed', { error });
      throw error;
    }
  }

  public async rollbackLastMigration(): Promise<void> {
    try {
      logger.info('Rolling back last migration...');

      const result = await this.pool.query(
        'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
      );

      if (result.rows.length === 0) {
        logger.warn('No migrations to rollback');
        return;
      }

      const lastMigration = result.rows[0].filename;
      
      // Check if rollback file exists
      const rollbackFile = lastMigration.replace('.sql', '.rollback.sql');
      const rollbackPath = join(this.migrationsPath, rollbackFile);

      try {
        const rollbackSQL = await readFile(rollbackPath, 'utf-8');
        
        const client = await this.pool.connect();
        
        try {
          await client.query('BEGIN');
          
          // Execute rollback
          await client.query(rollbackSQL);
          
          // Remove migration record
          await client.query(
            'DELETE FROM migrations WHERE filename = $1',
            [lastMigration]
          );
          
          await client.query('COMMIT');
          
          logger.info(`Successfully rolled back migration: ${lastMigration}`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        
      } catch (error) {
        logger.error(`Rollback file not found or invalid: ${rollbackFile}`);
        throw error;
      }

    } catch (error) {
      logger.error('Rollback failed', { error });
      throw error;
    }
  }

  public async getMigrationStatus(): Promise<any[]> {
    try {
      const allMigrations = await this.getMigrationFiles();
      const executedResult = await this.pool.query(
        'SELECT filename, executed_at FROM migrations ORDER BY id ASC'
      );
      
      const executedMap = new Map();
      executedResult.rows.forEach(row => {
        executedMap.set(row.filename, row.executed_at);
      });

      return allMigrations.map(migration => ({
        filename: migration.filename,
        executed: executedMap.has(migration.filename),
        executed_at: executedMap.get(migration.filename) || null,
        checksum: migration.checksum
      }));
    } catch (error) {
      logger.error('Failed to get migration status', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const migrationManager = new MigrationManager(pool);

// CLI functions for package.json scripts
export async function runMigrationsCommand(): Promise<void> {
  try {
    await migrationManager.runMigrations();
    logger.info('Migration command completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration command failed', { error });
    process.exit(1);
  }
}

export async function rollbackMigrationCommand(): Promise<void> {
  try {
    await migrationManager.rollbackLastMigration();
    logger.info('Rollback command completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Rollback command failed', { error });
    process.exit(1);
  }
}

export async function migrationStatusCommand(): Promise<void> {
  try {
    const status = await migrationManager.getMigrationStatus();
    console.log('\nMigration Status:');
    console.log('================');
    
    status.forEach(migration => {
      const status = migration.executed ? '✅ Executed' : '⏳ Pending';
      const date = migration.executed_at ? ` (${migration.executed_at})` : '';
      console.log(`${status} ${migration.filename}${date}`);
    });
    
    console.log('');
    process.exit(0);
  } catch (error) {
    logger.error('Migration status command failed', { error });
    process.exit(1);
  }
}