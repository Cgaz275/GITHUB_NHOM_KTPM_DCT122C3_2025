#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { argv } = yargs(hideBin(process.argv));
const command = argv._[0];
try {
  if (command === 'install') {
    await import('./install/index.js');
  } else {
    throw new Error('Only "install" command is supported. Usage: evershop-setup install');
  }
} catch (e) {
  import('../lib/log/logger.js').then((module) => {
    module.error(e);
  });
}
process.on('uncaughtException', function (exception) {
  import('../lib/log/logger.js').then((module) => {
    module.error(exception);
  });
});
process.on('unhandledRejection', (reason, p) => {
  import('../lib/log/logger.js').then((module) => {
    module.error(`Unhandled Rejection: ${reason} at: ${p}`);
  });
});
