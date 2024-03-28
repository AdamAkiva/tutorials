import readline from 'node:readline/promises';

import { pubsubExample } from './pub-sub/index.js';
import { routingExample } from './routing/index.js';
import { topicsExample } from './topics/index.js';
import { workersQueueExample } from './workers-queue/index.js';

/**********************************************************************************/

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const userInputOptions = new Set([
    '1',
    '2',
    '3',
    '4',
    'workers-queue',
    'pub-sub',
    'routing',
    'topics',
    'exit'
  ]);

  rl.on('close', () => {
    process.exit(0);
  });

  console.log(
    'Welcome to message queue examples, choose one of the following options to ' +
      'run the relevant exercise:\n1. workers-queue\n2. pub-sub\n3. routing' +
      "\n4. topics\nTo exit enter 'exit'"
  );
  while (true) {
    const opn = await rl.question('\nWhich exercise to run? ');
    if (!userInputOptions.has(opn)) {
      console.error(`'${opn}' is not a valid input, try again`);
      continue;
    }

    if (opn === 'exit' || opn === 'EXIT') {
      return rl.emit('close');
    }

    switch (opn) {
      case '1':
      case 'workers-queue':
        await workersQueueExample();
        break;
      case '2':
      case 'pub-sub':
        await pubsubExample();
        break;
      case '3':
      case 'routing':
        await routingExample();
        break;
      case '4':
      case 'topics':
        await topicsExample();
        break;
    }
  }
}

await main();
