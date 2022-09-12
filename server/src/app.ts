import consola from 'consola';
import express from 'express';
import http from 'http';
import path from 'path';

import type { AddressInfo } from 'net';

const app = express();

// Inject a middlewar function so the Express instrumentation has
// something more than the basic http request to see.
function logRequest (req, res, next) {
  console.log('logRequest middleware:', Date.now());
  next();
}
app.use(logRequest);

// Dummy endpoint at "/test"
app.get('/test', (req, res) => {
  res.send('GET request to /test\n');
});

export function startServer() : Express {
  const server = http.createServer(app);

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

  return server;
}
