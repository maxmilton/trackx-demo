// eslint-disable-next-line max-len
/* eslint-disable @typescript-eslint/no-unsafe-assignment, import/no-extraneous-dependencies, no-console */

import esbuild from 'esbuild';
import fs from 'fs/promises';
import { gitHash, isDirty } from 'git-ref';

// Workaround for no JSON import in ESM yet
/** @type {import('./package.json')} */
const pkg = JSON.parse(await fs.readFile('./package.json', 'utf8'));

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const release = `v${pkg.version}-${gitHash()}${isDirty() ? '-dev' : ''}`;

const out = await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/api/plugin.js',
  target: ['node16'],
  platform: 'node',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  external: ['better-sqlite3', 'source-map', 'source-map-support'],
  banner: { js: '#!/usr/bin/env node\n"use strict";' },
  bundle: true,
  sourcemap: true,
  minifySyntax: !dev,
  minifyIdentifiers: !dev,
  legalComments: 'none',
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});

if (out.metafile) {
  console.log(await esbuild.analyzeMetafile(out.metafile));
}
