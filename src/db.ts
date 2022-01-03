import SqliteDB, { Database } from 'better-sqlite3';
import type { DemoPluginConfig } from './types';

export function connectDB(config: DemoPluginConfig): Database {
  const db = new SqliteDB(config.DEMO_DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.debug : undefined,
  });

  process.on('exit', () => db.close());
  process.on('SIGHUP', () => process.exit(128 + 1));
  process.on('SIGINT', () => process.exit(128 + 2));
  process.on('SIGTERM', () => process.exit(128 + 15));

  db.pragma('trusted_schema = OFF');
  db.pragma('journal_mode = WAL');

  return db;
}
