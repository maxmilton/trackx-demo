/* eslint-disable import/no-extraneous-dependencies, no-console */

// FIXME: Update source maps too

import { walk, type ESTreeMap } from 'astray';
import * as ekscss from 'ekscss';
import fs from 'fs/promises';
import MagicString from 'magic-string';
import { parseModule, parseScript } from 'meriyah';
import path from 'path';
import { getConfig } from '../src/utils';

type FrontendConfig = typeof import('../frontend-trackx.config.mjs');
type ESTreeMapExtra = {
  // With extra props added via meriyah "ranges" option
  [K in keyof ESTreeMap]: ESTreeMap[K] & { start: number; end: number };
};

const config = getConfig();

const css = (template: TemplateStringsArray, ...substitutions: unknown[]) => {
  const compiled = ekscss.compile(String.raw(template, ...substitutions), {
    plugins: ['@ekscss/plugin-prefix'],
  });
  for (const warning of compiled.warnings) console.error(warning);
  return compiled.css;
};

/**
 * Get the literal value of a string with escaped backslash characters.
 */
const literal = (str: string) => JSON.stringify(str).slice(1, -1);

/**
 * Replace values but only within strings and not other source code.
 */
function replaceInStrings(
  source: string,
  replacements: [from: string | RegExp, to: string][],
  cjs?: boolean,
): string {
  const out = new MagicString(source);
  const ast = (cjs ? parseScript : parseModule)(source, {
    next: true,
    ranges: true,
  });

  walk<typeof ast, void, ESTreeMapExtra>(ast, {
    Literal(node) {
      if (!node.value || typeof node.value !== 'string') return;

      let newValue = literal(node.value);
      for (const [from, to] of replacements) {
        newValue = newValue.replaceAll(from, to);
      }
      out.overwrite(node.start + 1, node.end - 1, newValue);
    },
    TemplateElement(node) {
      if (!node.value.raw || typeof node.value.raw !== 'string') return;

      let newValue = node.value.raw;
      // let newValue = node.value.cooked;
      for (const [from, to] of replacements) {
        newValue = newValue.replaceAll(from, to);
      }
      out.overwrite(node.start, node.end, newValue);
    },
  });

  return out.toString();
}

(async () => {
  const apiDir = path.join(__dirname, '../dist/api');
  const dashDir = path.join(__dirname, '../dist/var/dash');

  const indexHtmlPath = path.join(dashDir, 'index.html');
  const loginHtmlPath = path.join(dashDir, 'login.html');
  const indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
  const loginHtml = await fs.readFile(loginHtmlPath, 'utf8');

  const demoBannerShort = '<div class="demo-alert alert">DEMO MODE</div>';
  // https://github.com/tailwindlabs/heroicons/blob/master/src/outline/information-circle.svg
  const demoBannerFull = '<div class="demo-alert alert" aria-label="In demo mode the dash app is read-only and issue search is disabled." data-tooltip>DEMO MODE <svg class="icon icon-info dib" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
  const newIndexHtml = indexHtml.replace(
    '<body class=dark>\n',
    `<body class=dark>\n  ${demoBannerFull}\n`,
  );
  const newLoginHtml = loginHtml
    .replace('<body class=dark>\n', `<body class=dark>\n${demoBannerShort}\n`)
    .replace('<input id=email', '<input id=email value="demo@trackx.app"')
    .replace('<input id=password', '<input id=password value="demodemo"');

  const serverScriptPath = path.join(apiDir, 'server.js');
  const trackxScriptPath = path.join(dashDir, 'trackx.js');
  const entryScriptPath = path.join(
    dashDir,
    indexHtml.match(/<script src=\/(app(?:-\w+)?\.js) /)![1],
  );
  const loginScriptPath = path.join(
    dashDir,
    loginHtml.match(/<script src=\/(login(?:-\w+)?\.js) /)![1],
  );
  const entryStylesPath = path.join(
    dashDir,
    indexHtml.match(/<link href=\/(app(?:-\w+)?\.css) /)![1],
  );
  const loginStylesPath = path.join(
    dashDir,
    loginHtml.match(/<link href=\/(login(?:-\w+)?\.css) /)![1],
  );

  const oldDashConfig = (await import(
    config.LIVE_FRONTEND_CONFIG_PATH
  )) as FrontendConfig;
  const newDashConfig = (await import(
    config.DEMO_FRONTEND_CONFIG_PATH
  )) as FrontendConfig;

  const [
    serverScript,
    trackxScript,
    entryScript,
    loginScript,
    entryStyles,
    loginStyles,
  ] = await Promise.all([
    fs.readFile(serverScriptPath, 'utf8'),
    fs.readFile(trackxScriptPath, 'utf8'),
    fs.readFile(entryScriptPath, 'utf8'),
    fs.readFile(loginScriptPath, 'utf8'),
    fs.readFile(entryStylesPath, 'utf8'),
    fs.readFile(loginStylesPath, 'utf8'),
  ]);
  const configMap: [string, string][] = [];

  for (const key of Object.keys(oldDashConfig)) {
    // @ts-expect-error - TODO:!
    const oldValue = oldDashConfig[key] as string;
    // @ts-expect-error - TODO:!
    const newValue = newDashConfig[key] as string;

    if (oldValue !== newValue) {
      configMap.push([oldValue, newValue]);
    }
  }

  const newServerScript = serverScript
    // Remove server /dash/* route request stats tracking
    .replace(/use\("\/dash\/\*", \w+, (\w+)\)/, 'use("/dash/*", $1)');
  const newTrackxScript = replaceInStrings(trackxScript, configMap);
  const newEntryScript = replaceInStrings(entryScript, configMap);
  const newLoginScript = replaceInStrings(loginScript, configMap);

  const cssDemoAlertShort = css`
    .demo-alert {
      margin: 0 0 0.5rem;
      letter-spacing: 5px;
      text-align: center;
    }
  `;
  const cssDemoAlertFull = css`
    .demo-alert {
      margin: 0 0 0.5rem;
      letter-spacing: 5px;
      text-align: center;

      & > .icon-info {
        vertical-align: -6px;
        width: 1.4rem;
        height: 1.4rem;
      }

      &[data-tooltip][aria-label] {
        &::before {
          top: calc(0.5rem + 100%);
          bottom: 0;
          letter-spacing: initial;
          // TODO: Remove after next @ekscss/framework release & update
          height: fit-content;
        }

        &::after {
          top: 100%;
          bottom: 0;
          border-width: 0 0.5rem 0.5rem;
        }
      }
    }
  `;
  const newEntryStylesCode = `${entryStyles}${cssDemoAlertFull}`;
  const newLoginStylesCode = `${loginStyles}${cssDemoAlertShort}`;

  await Promise.all([
    fs.writeFile(indexHtmlPath, newIndexHtml),
    fs.writeFile(loginHtmlPath, newLoginHtml),
    fs.writeFile(serverScriptPath, newServerScript),
    fs.writeFile(trackxScriptPath, newTrackxScript),
    fs.writeFile(entryScriptPath, newEntryScript),
    fs.writeFile(loginScriptPath, newLoginScript),
    fs.writeFile(entryStylesPath, newEntryStylesCode),
    fs.writeFile(loginStylesPath, newLoginStylesCode),
  ]);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
