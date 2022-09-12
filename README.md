# Demo for issue with Express nodejs opentelemetry autoinstrumentation

**THIS DEMO DOES NOT FUNCTION CORRECTLY, IT IS FOR A HELP REQUEST / PROBLEM REPORT**.

**DO NOT COPY THIS CODE, IT IS NOT A CORRECT EXAMPLE**

## What this does

Starts an Express server on port 3000 and instruments it using opentelemetry
http and express otel autoinstrumentations
[loaded via a tracing setup script](./server/tracing/tracing.ts)
in [node's `--require`](./server/package.json).

The server responds to GET requests to the `/test` endpoint, and has a single
simple global middleware function that logs the request timestamp to the console
so the Express tracing has something other than the initial request to trace.

Except that the Express traces never seem to fire, only the http traces.

The tracing initialization script is written in typescript and bundled with
esbuild, but no difference is observed when it's converted to handwritten cjs.

Package versions in [`package.json`](server/package.json); at time of writing

* `node` 18.4.0
* `npm` 8.15.1
* `express` 4.18.1
* `@opentelemetry/api` 1.2.0
* `@opentelemetry/core` 1.6.0 (and all other packages from `opentelemetry-js`)
* `@opentelemetry/instrumentation-http` 0.31.0
* `@opentelemetry/instrumentation-express` 0.31.0

## Run it

Run `make run`, or:

```
$ cd server
$ npm install
$ npm run build
```

then to run using a separate --require command line arg:

```
$ npm run start:separate
```

or to run by importing the tracing script into the main app:

```
$ npm run start:combined
```

## Typical startup output

```
cd server && npm run start:separate

> testapp@1.0.0 start
> NODE_ENV=production node --require ./dist/tracing.js dist

@opentelemetry/api: Registered a global for diag v1.2.0.
ℹ Adding ConsoleSpanExporter to log trace events to console                                                                                                                         10:27:04
@opentelemetry/api: Registered a global for trace v1.2.0.
@opentelemetry/api: Registered a global for context v1.2.0.
@opentelemetry/api: Registered a global for propagation v1.2.0.
@opentelemetry/instrumentation-http Applying patch for http@18.8.0

ready  Started server on port: http://localhost:3000                                                                                                                                10:27:04
```

## Hit the server with a request to the dummy endpoint

```
$ curl http://localhost:3000/test
GET request to /test
```

## Server output for GET request (start:separate)

When the tracing support is loaded using `--require ./dist/tracing.js`, a trace
span is emitted by the `@opentelemetry/instrumentation-http` instrumentation,
but *not* by the
[`@opentelemetry/instrumentation-express`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express)
instrumentation:

```
@opentelemetry/instrumentation-http http instrumentation incomingRequest
logRequest middleware: 1662950831354
{
  traceId: 'ecfb103322a9dd0272937d798567cdaa',
  parentId: undefined,
  name: 'HTTP GET',
  id: 'ba3c5eb54f6bff50',
  kind: 1,
  timestamp: 1662950831351585,
  duration: 6686,
  attributes: {
    'http.url': 'http://localhost:3000/test',
    'http.host': 'localhost:3000',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.target': '/test',
    'http.user_agent': 'curl/7.82.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 3000,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 41794,
    'http.status_code': 200,
    'http.status_text': 'OK'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

## Server output for GET request (start:combined)

When instrumentation is loaded by the code being traced, no tracing spans are
emitted at all.

## Expected result

One or more spans with Express data, resembling that in
[the examples in the docs for instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express/examples).

Expected to see at least a span for `GET /test` from the Express tracer, and
another for the `logRequest` middleware.

The http instrumentation loads and runs fine, so tracing is being loaded.
