import { init } from './init';

switch (process.argv[2]) {
  case undefined:
    break;
  case 'init':
    init();
    break;
  default:
    throw new Error(`Unknown command: ${process.argv[2]}`);
}

// eslint-disable-next-line no-restricted-exports
export { plugin as default } from './plugin';
