if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
  throw new Error('DO NOT USE DEVELOPMENT CONFIG IN PRODUCTION');
}

/** @type {import('trackx-api/src/types').TrackXAPIConfig} */
module.exports = {
  USERS: {
    // email = demo@trackx.app + password = demodemo
    'demo@trackx.app': [
      's1bpitrp',
      'JdbCTbhYMpXfMbmbPzvwfpBs9ehmrkL6QhS0Kny1MvnaVTL4qETmV9OJ15MISaXuIBj2aGrfbW6TpXxwKF8LMA==',
    ],
  },

  ROOT_DIR: __dirname,
  HOST: '127.0.0.1',
  PORT: 8100,
  DB_PATH: 'db/demo-trackx.db',
  DB_ZSTD_PATH: '',
  DB_INIT_SQL_PATH: '',
  DB_COMPRESSION: 0,
  REPORT_API_ENDPOINT: 'http://127.0.0.1:5000/api/v1/upvt8nvogp4',
  DASH_ORIGIN: 'http://localhost:5100', // with rate limiting
  // DASH_ORIGIN: 'http://localhost:5101', // without rate limiting

  MAX_EVENT_BYTES: 0,
  MAX_STACK_CHARS: 0,
  MAX_STACK_FRAMES: 0,
  MAX_UA_CHARS: 0,
  MAX_URI_CHARS: 0,
  NET_MAX_FILE_BYTES: 0,
  NET_RETRY: 0,
  NET_TIMEOUT: 0,
  SESSION_TTL: 2_400_000, // 40 minutes
};
