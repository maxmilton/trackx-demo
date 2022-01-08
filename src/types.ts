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
