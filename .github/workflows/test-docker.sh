#!/bin/bash

set -x
set -Eeuo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
repo_root_dir="${script_dir}/../.."
config_path="${repo_root_dir}/trackx.config.js.template"
demo_config_path="${repo_root_dir}/demo.config.js.template"

docker run --rm \
  --read-only \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --env CONFIG_PATH="/data/trackx.config.js" \
  --env DEMO_CONFIG_PATH="/data/demo.config.js" \
  --env DB_PATH="/tmp/db/trackx.db" \
  --env DEMO_MODE=true \
  --tmpfs /tmp/db:rw,noexec,nodev,nosuid,uid=5063,gid=5063,mode=0700,size=1m \
  --mount type=bind,src="$config_path",dst=/data/trackx.config.js,ro \
  --mount type=bind,src="$demo_config_path",dst=/data/demo.config.js,ro \
  --mount type=bind,src="${repo_root_dir}/dist/var/db/master.sql",dst=/data/db/master.sql \
  ci/trackx-demo-api /usr/bin/node plugin.js init
