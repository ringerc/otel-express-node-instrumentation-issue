import express from 'express';
import http from 'http';
import path from 'path';

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

export const server = http.createServer(app);
