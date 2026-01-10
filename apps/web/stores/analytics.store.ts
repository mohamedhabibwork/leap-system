import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DateRange, ChartConfig, WidgetState, ExportConfig } from './types';

interface AnalyticsState {
  // Date range for analytics
  dateRange: DateRange;
  
  // Selected metrics to display
  metrics: string[];
  
  // Chart configurations
  chartConfigs: Record<string, ChartConfig>;
  
  // Widget states
  widgets: Record<string, WidgetState>;
  
  // Export configuration
  exportConfig: ExportConfig | null;
  
  // Comparison mode
  comparisonEnabled: boolean;
  comparisonDateRange: DateRange | null;
  
  // Actions
  setDateRange: (range: DateRange) => void;
  setDateRangePreset: (preset: DateRange['preset']) => void;
  
  addMetric: (metric: string) => void;
  removeMetric: (metric: string) => void;
  toggleMetric: (metric: string) => void;
  setMetrics: (metrics: string[]) => void;
  
  updateChartConfig: (chartId: string, config: Partial<ChartConfig>) => void;
  setChartType: (chartId: string, type: ChartConfig['type']) => void;
  
  toggleWidget: (widgetId: string) => void;
  showWidget: (widgetId: string) => void;
  hideWidget: (widgetId: string) => void;
  setWidgetPosition: (widgetId: string, position: { x: number; y: number }) => void;
  setWidgetSize: (widgetId: string, size: { width: number; height: number }) => void;
  
  setExportConfig: (config: ExportConfig | null) => void;
  
  toggleComparison: () => void;
  setComparisonDateRange: (range: DateRange | null) => void;
  
  reset: () => void;
}

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  return {
    start,
    end,
    preset: 'month',
  };
};

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set) => ({
      dateRange: getDefaultDateRange(),
      metrics: [],
      chartConfigs: {},
      widgets: {},
      exportConfig: null,
      comparisonEnabled: false,
      comparisonDateRange: null,

      setDateRange: (range) =>
        set(
          { dateRange: range },
          false,
          'setDateRange'
        ),

      setDateRangePreset: (preset) =>
        set(
          (state) => {
            const end = new Date();
            const start = new Date();
            
            switch (preset) {
              case 'today':
                start.setHours(0, 0, 0, 0);
                break;
              case 'week':
                start.setDate(start.getDate() - 7);
                break;
              case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
              case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
              case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
            }
            
            return {
              dateRange: { start, end, preset },
            };
          },
          false,
          'setDateRangePreset'
        ),

      addMetric: (metric) =>
        set(
          (state) => ({
            metrics: [...state.metrics, metric],
          }),
          false,
          'addMetric'
        ),

      removeMetric: (metric) =>
        set(
          (state) => ({
            metrics: state.metrics.filter((m) => m !== metric),
          }),
          false,
          'removeMetric'
        ),

      toggleMetric: (metric) =>
        set(
          (state) => {
            const exists = state.metrics.includes(metric);
            return {
              metrics: exists
                ? state.metrics.filter((m) => m !== metric)
                : [...state.metrics, metric],
            };
          },
          false,
          'toggleMetric'
        ),

      setMetrics: (metrics) =>
        set(
          { metrics },
          false,
          'setMetrics'
        ),

      updateChartConfig: (chartId, config) =>
        set(
          (state) => ({
            chartConfigs: {
              ...state.chartConfigs,
              [chartId]: { ...state.chartConfigs[chartId], ...config } as ChartConfig,
            },
          }),
          false,
          'updateChartConfig'
        ),

      setChartType: (chartId, type) =>
        set(
          (state) => ({
            chartConfigs: {
              ...state.chartConfigs,
              [chartId]: {
                ...(state.chartConfigs[chartId] || { metrics: [] }),
                type,
              },
            },
          }),
          false,
          'setChartType'
        ),

      toggleWidget: (widgetId) =>
        set(
          (state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...(state.widgets[widgetId] || {}),
                visible: !state.widgets[widgetId]?.visible,
              },
            },
          }),
          false,
          'toggleWidget'
        ),

      showWidget: (widgetId) =>
        set(
          (state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...(state.widgets[widgetId] || {}),
                visible: true,
              },
            },
          }),
          false,
          'showWidget'
        ),

      hideWidget: (widgetId) =>
        set(
          (state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...(state.widgets[widgetId] || {}),
                visible: false,
              },
            },
          }),
          false,
          'hideWidget'
        ),

      setWidgetPosition: (widgetId, position) =>
        set(
          (state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...(state.widgets[widgetId] || { visible: true }),
                position,
              },
            },
          }),
          false,
          'setWidgetPosition'
        ),

      setWidgetSize: (widgetId, size) =>
        set(
          (state) => ({
            widgets: {
              ...state.widgets,
              [widgetId]: {
                ...(state.widgets[widgetId] || { visible: true }),
                size,
              },
            },
          }),
          false,
          'setWidgetSize'
        ),

      setExportConfig: (config) =>
        set(
          { exportConfig: config },
          false,
          'setExportConfig'
        ),

      toggleComparison: () =>
        set(
          (state) => ({
            comparisonEnabled: !state.comparisonEnabled,
          }),
          false,
          'toggleComparison'
        ),

      setComparisonDateRange: (range) =>
        set(
          { comparisonDateRange: range },
          false,
          'setComparisonDateRange'
        ),

      reset: () =>
        set(
          {
            dateRange: getDefaultDateRange(),
            metrics: [],
            chartConfigs: {},
            widgets: {},
            exportConfig: null,
            comparisonEnabled: false,
            comparisonDateRange: null,
          },
          false,
          'reset'
        ),
    }),
    { name: 'analytics' }
  )
);

// Selectors
export const selectDateRange = (state: AnalyticsState) => state.dateRange;

export const selectMetrics = (state: AnalyticsState) => state.metrics;

export const selectChartConfig = (chartId: string) => (state: AnalyticsState) =>
  state.chartConfigs[chartId];

export const selectWidget = (widgetId: string) => (state: AnalyticsState) =>
  state.widgets[widgetId];

export const selectIsWidgetVisible = (widgetId: string) => (state: AnalyticsState) =>
  state.widgets[widgetId]?.visible ?? true;
