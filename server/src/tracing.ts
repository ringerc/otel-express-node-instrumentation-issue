/*
 * This script loads OpenTelemetry opentelemetry and metrics instrumentation. It needs
 * to be loaded before the Express server it instruments, via --require or by
 * a require('./tracing') before anything else is imported.
 */

import * as opentelemetry from '@opentelemetry/api';

import { DiagConsoleLogger } from '@opentelemetry/api';
import { AlwaysOnSampler } from '@opentelemetry/core';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { SemanticAttributes, SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Individual instrumentations
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation, ExpressRequestInfo } from '@opentelemetry/instrumentation-express';

const appNamespace = 'testapp';
const appName = 'testapp';

const otelLogLevel = opentelemetry.DiagLogLevel.ALL;

export function initOpenTelemetry() : { provider: NodeTracerProvider } {
  opentelemetry.diag.setLogger(new DiagConsoleLogger(), otelLogLevel);

  var provider : NodeTracerProvider;
  try {

    const semanticResources = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: appName,
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: appNamespace,
    });

    const sampler = new AlwaysOnSampler();

    provider = new NodeTracerProvider({
      resource: semanticResources,
      sampler: sampler,
    });
    provider.register({});

    // Log trace spans to the console for testing
    console.info("Adding ConsoleSpanExporter to log trace events to console");
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    const httpInstrumentation = new HttpInstrumentation();

    const expressInstrumentation =
      new ExpressInstrumentation({
        // info.request is a https://expressjs.com/en/api.html#req
        requestHook: function (span: Span, info: ExpressRequestInfo) {
          console.log("Express requesthook() reached");
        },
      });

    registerInstrumentations({
      instrumentations: [ httpInstrumentation, expressInstrumentation ],
    })
  } catch (e) {
    console.error('OpenTelemetry initailization failed. Continuing anyway. Exception: ' + e);
  }

  return provider;
}

// Allow tracing to be invoked by --require or separately imported and called
if (require.main !== module) {
  console.log("initOpenTelemetry() called directly in tracing.ts")
  const provider = initOpenTelemetry();
} else {
  console.log("initOpenTelemetry() to be called from importer")
}
