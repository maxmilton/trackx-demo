[![Build status](https://img.shields.io/github/actions/workflow/status/maxmilton/trackx-demo/ci.yml?branch=master)](https://github.com/maxmilton/trackx-demo/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/maxmilton/trackx-demo)](https://codeclimate.com/github/maxmilton/trackx-demo)
[![Licence](https://img.shields.io/github/license/maxmilton/trackx-demo.svg)](https://github.com/maxmilton/trackx-demo/blob/master/LICENSE)

# TrackX Demo

Tools to power a TrackX demo site like <https://demo.trackx.app>. A demo is a full TrackX instance that is read-only and uses a subset of data from a live TrackX instance.

### Features

- Automation to build the TrackX platform and modify it for use as a demo:
  - Replace front end app configuration values that are baked into the output JS.
  - Inject a demo banner into front end apps.
  - Inject demo user email and password into the login page inputs.
- TrackX API server plugin which:
  - Initializes a demo database.
  - Replaces tables with views that point to the live database.

### Goals

- Don't add demo specific things to <https://github.com/maxmilton/trackx>; anyone who runs regular TrackX must have zero impact.
- No performance impact on the live instance.
- Performance should be similar to regular TrackX.
- The dashboard should still be real-time.

## How does it work, technically?

A demo is a full TrackX backend and frontend build with certain modifications. Beyond build-time changes to configuration and visual tweaks, the real magic happens at runtime in a TrackX API plugin.

First, the plugin runs as a separate process. It creates a database, initializes its base structure, then exits. Next, the API server starts and all the database prepared statements are validated and compiled. At this point, the database is almost the same as a regular live instance. Finally, towards the end of the API server start-up process, it loads the plugin. Using the demo database connection, the plugin attaches the live database, drops anything we don't need and creates views to replace essential tables (pointing to the live database).

The demo database is ephemeral, and only a tiny amount of unique data is stored there. The rest of the data comes from the live database via views that restrict project/data access.

In the demo docker container, the live database is read-only. That makes it impossible to change the live database, even by accident. The SQLite databases use [WAL journal mode](https://www.sqlite.org/wal.html), so multiple concurrent reads are possible without blocking. The demo should have no impact on the live instance performance.

## Usage

> Note: You'll need the <https://github.com/maxmilton/trackx> files in a directory parallel to this one.

### Install dependencies

```sh
pnpm install
```

### Build and pack for production

1. Edit the frontend configuration; `frontend-trackx.config.mjs`.
1. Create a docker compose configuration file from the template and edit:
   ```sh
   cp docker-compose.yml.template docker-compose.yml
   ```
1. Run the build:
   ```sh
   pnpm run setup
   ```
1. Copy the resulting `trackx-demo.tar.gz` file to your server.
1. Follow the relevant steps of the normal [TrackX installation instructions](https://docs.trackx.app/#/getting-started/installation.md) but unpack to `/opt/trackx-demo`:
   ```sh
   mkdir -p /opt/trackx-demo && tar -xzf trackx-demo.tar.gz -C /opt/trackx-demo && rm trackx-demo.tar.gz
   ```
1. [SERVER] Create a demo config from the template and edit:
   ```sh
   cp /opt/trackx-demo/etc/demo.config.js.template /opt/trackx-demo/etc/demo.config.js
   ```
1. [SERVER] Create a hard link to the Nginx vhost config:
   ```sh
   ln -f /opt/trackx-demo/etc/nginx/conf.d/demo.trackx.app.conf /opt/trackx/etc/nginx/conf.d/
   ```
1. Reload Nginx.

### Development

> Set up the parent `trackx` [development environment](https://docs.trackx.app/#/advanced-guides/development.md) first.

```sh
pnpm run setup-dev
```

```sh
pnpm run serve
```

Linting & testing:

```sh
pnpm run lint
```

```sh
pnpm run test
```

## Bugs

Report any bugs you encounter on the [GitHub issue tracker](https://github.com/maxmilton/trackx-demo/issues).

## License

MIT license. See [LICENSE](https://github.com/maxmilton/trackx-demo/blob/master/LICENSE).

---

© 2022 [Max Milton](https://maxmilton.com)
