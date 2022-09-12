import { initOpenTelemetry } from './tracing'
initOpenTelemetry();

// It seems to be necessary to 'require' this verbatim. Using
//     import { startServer } from './app';
// instead causes autoinstrumentation not to be placed.
const { startServer } = require('./app');
startServer();
