import consola from 'consola';
import type { AddressInfo } from 'net';

import { server } from './app';

consola.log('\n');

server.listen(3000, () => {
  const { port } = server.address() as AddressInfo;
  consola.log('\n');
  consola.ready(
    `\x1b[34m Started server on port\x1b[0m: \x1b[35mhttp://localhost:${port}\x1b[0m${
      process.env.MOCKS ? ' with \x1b[32mmocks enabled\x1b[0m' : ''
    }`,
  );
  consola.log('\n');
});
