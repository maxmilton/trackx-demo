import fs from 'fs';
import { connectDB } from './db';
import { getConfig } from './utils';

export function init(): void {
  const config = getConfig();
  const db = connectDB(config);

  // eslint-disable-next-line no-console
  console.info('Database initialising...');

  db.exec(fs.readFileSync(config.DB_SCHEMA_PATH, 'utf8'));

  // eslint-disable-next-line no-console
  console.info('Database initialised.');
}
