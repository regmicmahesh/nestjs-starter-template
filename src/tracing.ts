/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const traceExportUrl = process.env.TRACING_EXPORTER_URL;
const traceServiceName = process.env.TRACING_SERVICE_NAME;

const metricsServerPort = parseInt(process.env.METRICS_SERVER_PORT);

const traceExporter = new OTLPTraceExporter({
  url: traceExportUrl,
});

const metricsExporter = new PrometheusExporter({
  port: metricsServerPort,
});

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: traceServiceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: traceExporter,
  metricReader: metricsExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  console.log('Tracing SDK shut down.');
  return process.exit(0);
});
