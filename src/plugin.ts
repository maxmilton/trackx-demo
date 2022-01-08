import type { Plugin } from 'trackx-api/src/types';
import { getConfig } from './utils';

export const plugin: Plugin = ({ db, logger }) => {
  logger.log('DEMO PLUGIN LOADED');

  const demoConfig = getConfig();

  db.exec(`ATTACH DATABASE '${demoConfig.LIVE_DB_PATH}' AS live;`);

  const projectIds = db
    .prepare(
      `SELECT id FROM live.project WHERE name IN ('${demoConfig.PROJECT_ALLOWLIST.join(
        "','",
      )}')`,
    )
    .pluck()
    .all()
    .join(',');

  db.exec(
    `BEGIN TRANSACTION;

DROP INDEX issue_ts_last_idx;
DROP INDEX issue_list_idx;
DROP INDEX issue_state_idx;
DROP INDEX event_graph_idx;
DROP INDEX event_list_idx;
DROP TRIGGER issue_ai;
DROP TRIGGER issue_ad;
DROP TABLE daily_pings;
DROP TABLE daily_events;
DROP TABLE session_graph;
DROP TABLE event;
DROP TABLE issue;
DROP TABLE project;

CREATE TEMPORARY VIEW project
  AS SELECT * FROM live.project WHERE id IN (${projectIds});

CREATE TEMPORARY VIEW issue
  AS SELECT * FROM live.issue WHERE project_id IN (${projectIds});

CREATE TEMPORARY VIEW event
  AS SELECT * FROM live.event WHERE project_id IN (${projectIds});

CREATE TEMPORARY VIEW session_graph
  AS SELECT * FROM live.session_graph WHERE project_id IN (${projectIds});

CREATE TEMPORARY VIEW daily_events
  AS SELECT * FROM live.daily_events;

CREATE TEMPORARY VIEW daily_pings
  AS SELECT * FROM live.daily_pings;

COMMIT;`,
  );

  // Prevent data changes; similar to read-only mode
  // https://www.sqlite.org/pragma.html#pragma_query_only
  db.pragma('query_only = ON');
};
