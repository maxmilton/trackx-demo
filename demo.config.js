/** @type {import('./src/types').DemoPluginConfig} */
module.exports = {
  DEMO_ROOT_DIR: __dirname,
  LIVE_FRONTEND_CONFIG_PATH: '../trackx/packages/trackx-dash/trackx.config.mjs',
  DEMO_FRONTEND_CONFIG_PATH: 'frontend-trackx.config.mjs',
  LIVE_DB_PATH: 'live-db/trackx.db',
  DEMO_DB_PATH: 'db/demo-trackx.db',
  DB_SCHEMA_PATH: 'live-db/master.sql',
  PROJECT_ALLOWLIST: ['trackx-demo', 'trackx-docs'],
};
