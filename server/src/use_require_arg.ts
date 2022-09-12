/*
 * initOpenTelemetry() was called by --require tracing.ts before this file loads.
 *
 * It is in a separate bundle, tracing.js
 */
const { startServer} = require('./app');
startServer();
