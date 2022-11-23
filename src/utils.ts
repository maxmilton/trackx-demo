import path from 'path';
import type { DemoPluginConfig } from './types';

export function getConfig(): DemoPluginConfig & { DEMO_CONFIG_PATH: string } {
  const DEMO_CONFIG_PATH = path.resolve(
    __dirname,
    process.env.DEMO_CONFIG_PATH || '../../demo.config.js',
  );
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  const rawConfig = require(DEMO_CONFIG_PATH) as DemoPluginConfig;
  // Override config values with env vars
  for (const key of Object.keys(rawConfig)) {
    if (process.env[key] !== undefined) {
      // @ts-expect-error - unavoidable string indexing
      rawConfig[key] = process.env[key];
    }
  }
  const rootDir = path.resolve(__dirname, rawConfig.DEMO_ROOT_DIR || '.');

  return {
    ...rawConfig,
    DEMO_CONFIG_PATH,
    LIVE_FRONTEND_CONFIG_PATH: path.resolve(
      rootDir,
      rawConfig.LIVE_FRONTEND_CONFIG_PATH,
    ),
    DEMO_FRONTEND_CONFIG_PATH: path.resolve(
      rootDir,
      rawConfig.DEMO_FRONTEND_CONFIG_PATH,
    ),
    LIVE_DB_PATH: path.resolve(rootDir, rawConfig.LIVE_DB_PATH),
    DEMO_DB_PATH: path.resolve(rootDir, rawConfig.DEMO_DB_PATH),
    DB_SCHEMA_PATH: path.resolve(rootDir, rawConfig.DB_SCHEMA_PATH),
  };
}
