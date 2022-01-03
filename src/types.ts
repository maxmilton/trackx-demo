import type { Database } from 'better-sqlite3';
import type { TrackXAPIConfig } from 'trackx-api/src/types';

export interface DemoTrackXAPIConfig extends TrackXAPIConfig {
  DEMO_MODE: boolean;
}

export type TrackXAPIPlugin = (context: {
  app: any;
  config: DemoTrackXAPIConfig;
  db: Database;
  logger: Record<string, (msg: string | Error, ...args: any[]) => void>;
}) => void;

export interface DemoPluginConfig {
  DEMO_ROOT_DIR?: string;
  LIVE_FRONTEND_CONFIG_PATH: string;
  DEMO_FRONTEND_CONFIG_PATH: string;
  LIVE_DB_PATH: string;
  DEMO_DB_PATH: string;
  DB_SCHEMA_PATH: string;
  /**
   * List of project names from the live database to show in the demo dash app.
   */
  PROJECT_ALLOWLIST: string[];
}
