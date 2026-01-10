import { Module } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

/**
 * Prometheus Monitoring Module
 * 
 * Exposes metrics endpoint at /metrics for Prometheus to scrape
 * Provides custom application metrics
 */
@Module({
  imports: [
    NestPrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'lms_',
        },
      },
    }),
  ],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class PrometheusMonitoringModule {}
