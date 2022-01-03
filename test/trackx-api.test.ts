import fs from 'fs/promises';
import path from 'path';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
// import { getConfig } from '../src/utils';

const SERVER_JS_PATH = path.join(__dirname, '../dist/api/server.js');

test('database file must exist', async () => {
  const serverScript = await fs.readFile(SERVER_JS_PATH, 'utf8');
  assert.ok(serverScript.includes('fileMustExist: !0'));
  assert.is(serverScript.match(/fileMustExist: !0/)!.length, 1);
});

// test('database connection is read-only', async () => {
//   const serverScript = await fs.readFile(SERVER_JS_PATH, 'utf8');
//   assert.ok(serverScript.includes('readonly: !0,\n  fileMustExist: !0'));
// });

test.run();
