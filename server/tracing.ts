/*
 * This script loads OpenTelemetry opentelemetry and metrics instrumentation. It needs
 * to be loaded before the Express server it instruments, via --require .
 */

import consola from 'consola';

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

function initOpenTelemetry() : { provider: NodeTracerProvider } {
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
    consola.info("Adding ConsoleSpanExporter to log trace events to console");
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    const httpInstrumentation = new HttpInstrumentation();

    const expressInstrumentation =
      new ExpressInstrumentation({
        // info.request is a https://expressjs.com/en/api.html#req
        requestHook: function (span: Span, info: ExpressRequestInfo) {
          // !!! I am never called !!!
          consola.log("XXX in requestHook");
          process.exit(1);
        },
      });

    registerInstrumentations({
      instrumentations: [ httpInstrumentation, expressInstrumentation ],
    })
  } catch (e) {
    consola.error('OpenTelemetry initailization failed. Continuing anyway. Exception: ' + e);
  }

  return provider;
}

const provider = initOpenTelemetry();
